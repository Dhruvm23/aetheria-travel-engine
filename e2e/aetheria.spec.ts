import { test, expect } from '@playwright/test';

test.describe('Aetheria Travel Engine E2E Verification', () => {

  // Pillar 1: Smart Assistant (NLP Parser & Tweak Engine)
  test('Pillar 1: NLP Parser extracts parameters from natural language', async ({ page }) => {
    let capturedPayload: any;
    await page.route('/api/plan', async (route) => {
      capturedPayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({ status: 200, json: { id: 'mock' } }); // Dummy response
    });

    await page.goto('/');

    // Type the prompt that should trigger NLP extraction
    const promptInput = page.locator('#prompt');
    await promptInput.fill('Budget 3-day trip to Rome with history focus');

    // Fill required fields to allow submission
    await page.locator('#destination').fill('Rome');
    await page.locator('#start-date').fill('2026-05-10');
    await page.locator('#end-date').fill('2026-05-13');
    await page.getByRole('button', { name: /Generate AI itinerary/i }).click();

    // Verify the NLP parser successfully updated the form state
    expect(capturedPayload).toBeDefined();
    expect(capturedPayload.budget).toBe('budget');
    expect(capturedPayload.interests).toContain('history');
  });

  test('Pillar 1: Tweak Engine dynamically updates the itinerary', async ({ page }) => {
    // Intercept the /api/plan to provide a fast mock response
    await page.route('/api/plan', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 'mock-itin-1',
          tripTitle: 'Rome Explorer',
          destination: 'Rome',
          country: 'Italy',
          startDate: '2026-05-10',
          endDate: '2026-05-13',
          totalDays: 3,
          travelerProfile: { budget: 'budget', interests: ['history'], accessibilityNeeds: {}, groupSize: 1 },
          packingSuggestions: [],
          totalEstimatedCost: { amount: 300, currency: 'USD', tier: 'budget' },
          emergencyContacts: [],
          localPhrases: [],
          days: [
            {
              dayNumber: 1,
              date: '2026-05-10',
              theme: 'Ancient Rome',
              activities: [
                {
                  id: 'a1', name: 'Colosseum', description: 'Amphitheatre',
                  location: { lat: 41.8902, lng: 12.4922 }, address: 'Rome',
                  startTime: '09:00', endTime: '11:00', durationMinutes: 120,
                  category: 'landmark', estimatedCost: { amount: 20, currency: 'USD', tier: 'budget' },
                  transitFromPrevious: null, accessibilityInfo: { wheelchairAccessible: true, mobilityRating: 1, notes: '' },
                  culturalNotes: [], imageQuery: 'Colosseum', tags: []
                }
              ],
              totalCost: { amount: 20, currency: 'USD', tier: 'budget' }
            }
          ]
        }
      });
    });

    // Intercept /api/tweak
    await page.route('/api/tweak', async (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const originalItin = requestBody.itinerary;
      
      // Return a modified itinerary where the Colosseum is changed to "Villa Borghese Park"
      originalItin.days[0].activities[0].name = 'Villa Borghese Park';
      
      await route.fulfill({
        status: 200,
        json: originalItin
      });
    });

    await page.goto('/');

    // Submit form
    await page.locator('#destination').fill('Rome');
    await page.locator('#start-date').fill('2026-05-10');
    await page.locator('#end-date').fill('2026-05-13');
    await page.getByRole('button', { name: /Generate AI itinerary/i }).click();

    // Verify initial render
    await expect(page.getByText('Colosseum')).toBeVisible();

    // Submit tweak
    const tweakInput = page.getByPlaceholder(/Ask Aetheria/i);
    await tweakInput.fill('Swap activity 2 with a park');
    await tweakInput.press('Enter');

    // Assert UI updates dynamically
    await expect(page.getByText('Villa Borghese Park')).toBeVisible();
    await expect(page.getByText('Colosseum')).not.toBeVisible();
  });

  // Pillar 2: Logical Decision Making (SaaS Gating & Cache)
  test('Pillar 2: Auth Gating intercepts premium/saving actions', async ({ page }) => {
    // Provide a basic mock itinerary to enable the "Save" button
    await page.route('/api/plan', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 'mock-itin-2',
          tripTitle: 'Test Trip',
          destination: 'Test',
          country: 'Test',
          startDate: '2026-05-10',
          endDate: '2026-05-11',
          totalDays: 1,
          travelerProfile: { budget: 'moderate', interests: [], accessibilityNeeds: {}, groupSize: 1 },
          packingSuggestions: [],
          totalEstimatedCost: { amount: 100, currency: 'USD', tier: 'moderate' },
          emergencyContacts: [],
          localPhrases: [],
          days: []
        }
      });
    });

    await page.goto('/');
    await page.locator('#destination').fill('Test');
    await page.locator('#start-date').fill('2026-05-10');
    await page.locator('#end-date').fill('2026-05-11');
    await page.getByRole('button', { name: /Generate AI itinerary/i }).click();

    // Verify Save button shows login required and opens modal
    const saveBtn = page.getByRole('button', { name: /Save \(Login required\)/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify Modal appears
    await expect(page.getByRole('dialog', { name: /Sign in to Aetheria/i })).toBeVisible();
    await page.keyboard.press('Escape'); // Close modal
    await expect(page.getByRole('dialog', { name: /Sign in to Aetheria/i })).not.toBeVisible();

    // Verify Disrupt Drawer Premium gating
    const disruptTrigger = page.getByRole('button', { name: /Disrupt \(PRO\)/i });
    await disruptTrigger.click();

    // The Disrupt UI has an overlay for non-logged in users. Wait, the click just opens the SignInModal!
    // Let's assert SignInModal opens again
    await expect(page.getByRole('dialog', { name: /Sign in to Aetheria/i })).toBeVisible();
  });

  test('Pillar 2: Deterministic Server-Side Cache serves repeat requests instantly', async ({ request }) => {
    test.setTimeout(60000); // Allow up to 60s for the first real API call
    const payload = {
      destination: 'Tokyo',
      startDate: '2026-10-01',
      endDate: '2026-10-05',
      budget: 'luxury',
      interests: ['food', 'shopping'],
      groupSize: 2,
      accessibilityNeeds: {
        wheelchairRequired: false,
        limitedMobility: false,
        visualImpairment: false,
        hearingImpairment: false,
        elderlyTraveler: false,
      },
      specialRequirements: 'test-cache-key'
    };

    // First request (Cold hit or first load)
    const t0 = Date.now();
    const res1 = await request.post('/api/plan', { data: payload });
    expect(res1.ok()).toBeTruthy();
    const duration1 = Date.now() - t0;

    // Second request (Must be served from memory cache)
    const t1 = Date.now();
    const res2 = await request.post('/api/plan', { data: payload });
    expect(res2.ok()).toBeTruthy();
    const duration2 = Date.now() - t1;

    // The cache should respond significantly faster
    // In CI, < 500ms is a safe threshold for an in-memory cache hit
    expect(duration2).toBeLessThan(500);
    
    // Also verify data integrity is identical
    const data1 = await res1.json();
    const data2 = await res2.json();
    expect(data1.id).toEqual(data2.id); // Same ID implies cached response
  });

  // Pillar 3 & 4: Resilience & Fallback
  test('Pillar 3 & 4: Fallback Engine activates on 503 error', async ({ page }) => {
    // Intercept /api/plan to force a 503 server error from the AI
    // The server handler catches this and returns a 200 with the fallback itinerary
    // We will simulate a payload that has specialRequirements: "simulate_503"
    // Wait, the test requirements say "Force a mock network failure or simulated 503 return". 
    // We can just use the `simulate_503` flag built into our backend.

    await page.goto('/');
    
    // Fill out form
    await page.locator('#destination').fill('Offline City');
    await page.locator('#start-date').fill('2026-05-10');
    await page.locator('#end-date').fill('2026-05-12');
    
    // Trigger 503 simulation
    const promptInput = page.locator('#prompt');
    await promptInput.fill('simulate_503');

    await page.getByRole('button', { name: /Generate AI itinerary/i }).click();

    // Verify Offline Banner
    await expect(page.getByText('Offline Mode Active')).toBeVisible();

    // Verify Procedural Itinerary
    await expect(page.getByText('Offline Trip to Offline City')).toBeVisible();
    await expect(page.getByText('Morning Exploration')).toBeVisible();
  });
});
