import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function sendReminders() {
  console.log('=== Sending push reminders ===');
  const now = new Date();
  const in30min = new Date(now.getTime() + 30 * 60000);
  const dayOfWeek = now.getDay();

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, start_time, modality')
    .contains('days_of_week', [dayOfWeek]);

  if (!classes?.length) {
    console.log('No classes today');
    return;
  }

  let sent = 0;
  for (const cls of classes) {
    const [h, m] = cls.start_time.split(':').map(Number);
    const classTime = new Date(now);
    classTime.setHours(h, m, 0, 0);

    if (classTime > now && classTime <= in30min) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', cls.id)
        .eq('status', 'active');

      for (const e of enrollments ?? []) {
        await supabase.from('notifications').insert({
          user_id: e.student_id,
          title: 'Aula em 30 min!',
          body: `${cls.name} (${cls.modality}) as ${cls.start_time}`,
          type: 'class_reminder',
        });
        sent++;
      }
    }
  }
  console.log(`Reminders sent: ${sent}`);
}

sendReminders().catch(console.error);
