// Stub for site — trial registration calls the app API
interface RegisterTrialData {
  name: string;
  phone: string;
  source?: string;
  modalities_interest?: string[];
  experience_level?: string;
}

export async function registerTrialFromWebsite(
  _academyId: string,
  data: RegisterTrialData,
): Promise<{ id: string } | null> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.blackbelts.com.br';
    const res = await fetch(`${appUrl}/api/trial/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
