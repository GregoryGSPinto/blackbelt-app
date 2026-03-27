import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function processTrialMessages() {
  console.log('=== Processing trial messages ===');

  const { data: trials } = await supabase
    .from('trial_students')
    .select('*, profiles(display_name, email, phone)')
    .eq('status', 'active');

  if (!trials?.length) {
    console.log('No active trials');
    return;
  }

  let sent = 0;
  for (const trial of trials) {
    const dayNumber = Math.ceil(
      (Date.now() - new Date(trial.created_at).getTime()) / 86400000,
    );
    const messages: Record<number, string> = {
      1: 'Bem-vindo(a) a academia! Aproveite sua primeira aula experimental.',
      2: 'Como foi seu primeiro treino? Qualquer duvida, estamos aqui!',
      3: 'Dica: chegue 10 minutos antes da aula para aquecer.',
      5: 'Faltam 2 dias! Esta gostando? Converse com a recepcao sobre nossos planos.',
      6: 'Ultimo dia amanha! Nao perca a oportunidade de continuar evoluindo.',
      7: 'Seu periodo experimental encerra hoje. Matricule-se e ganhe desconto especial!',
    };

    if (messages[dayNumber]) {
      await supabase.from('notifications').insert({
        user_id: trial.student_id,
        title: `Dia ${dayNumber}/7 — Aula Experimental`,
        body: messages[dayNumber],
        type: 'trial_reminder',
      });
      sent++;
      console.log(`  Day ${dayNumber}: ${trial.profiles?.display_name}`);
    }
  }

  const { data: expired } = await supabase
    .from('trial_students')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('trial_end_date', new Date().toISOString().split('T')[0])
    .select();

  console.log(`Sent: ${sent}, Expired: ${expired?.length ?? 0}`);
}

processTrialMessages().catch(console.error);
