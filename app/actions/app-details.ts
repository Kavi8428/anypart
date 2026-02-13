'use server';

export async function getAppLogo() {
    try {
        // Note: In Server Actions, if we call an API via fetch, we should use absolute URL.
        // However, calling internal APIs from Server Actions via fetch is usually not recommended 
        // due to performance overhead, but following the user's specific architecture request.
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const response = await fetch(`${baseUrl}/api/app-details`, {
            method: 'GET',
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data?.logo_url || null;
    } catch (error) {
        console.error('Action Error (Get App Logo):', error);
        return null;
    }
}
