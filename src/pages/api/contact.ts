import type { APIRoute } from 'astro';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'Requête invalide.' }, 400);
  }

  // Anti-spam : le honeypot doit rester vide. On répond "ok" pour ne pas
  // signaler aux bots que leur envoi a été détecté.
  if (String(form.get('website') ?? '').trim() !== '') {
    return json({ ok: true });
  }

  const nom = String(form.get('nom') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const sujet = String(form.get('sujet') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();

  if (!nom || !email || !sujet || !message) {
    return json({ ok: false, error: 'Tous les champs sont obligatoires.' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'Adresse email invalide.' }, 400);
  }
  if (nom.length > 200 || sujet.length > 300 || message.length > 5000) {
    return json({ ok: false, error: 'Message trop long.' }, 400);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const destinataire = import.meta.env.CONTACT_TO_EMAIL ?? 'admin@asil-impro.fr';
  const expediteur = import.meta.env.CONTACT_FROM_EMAIL ?? 'contact@asil-impro.fr';

  // Sans clé Resend (dev local) : on logge et on répond ok.
  if (!apiKey) {
    console.log('[contact] (mode dev, pas de RESEND_API_KEY)', { nom, email, sujet, message });
    return json({ ok: true });
  }

  const reponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `ASIL Impro <${expediteur}>`,
      to: [destinataire],
      reply_to: email,
      subject: `[Site ASIL] ${sujet}`,
      text: `Nouveau message depuis le formulaire de contact du site.\n\nNom : ${nom}\nEmail : ${email}\nSujet : ${sujet}\n\nMessage :\n${message}`,
    }),
  });

  if (!reponse.ok) {
    console.error('[contact] Erreur Resend', reponse.status, await reponse.text());
    return json({ ok: false, error: "L'envoi a échoué. Réessayez plus tard." }, 502);
  }

  return json({ ok: true });
};
