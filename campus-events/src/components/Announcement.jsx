import React from 'react';

const announcements = [
  {
    id: 1,
    title: 'Campus Hub Launch Update',
    category: 'Platform',
    date: 'Apr 12, 2026',
    detail: 'The new campus portal is now live with event feeds, club dashboards, and live announcements.',
  },
  {
    id: 2,
    title: 'Spring Hackathon Registration',
    category: 'Event',
    date: 'Apr 15, 2026',
    detail: 'Sign up for the 48-hour Spring Hackathon and build your team before the deadline.',
  },
  {
    id: 3,
    title: 'New Wellness Club Open Call',
    category: 'Club',
    date: 'Apr 18, 2026',
    detail: 'Join the Wellness Club for mentorship sessions, campus health programs, and community meetups.',
  },
];

const Announcement = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="futuristic-card overflow-hidden border border-slate-700/60 shadow-[0_35px_90px_rgba(14,165,233,0.14)]">
        <div className="grid gap-8 lg:grid-cols-[1.8fr_0.9fr] p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Campus Announcements</p>
            <h1 className="mt-4 text-4xl font-extrabold text-slate-100">Stay updated with campus life</h1>
            <p className="mt-4 max-w-2xl text-slate-400 leading-relaxed">
              Explore the latest updates, club announcements, event reminders, and campus news in one futuristic dashboard.
            </p>

            <div className="mt-10 space-y-4">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.8rem] border border-slate-700/70 bg-slate-950/90 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.18)] transition hover:-translate-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{item.category}</p>
                      <h2 className="mt-3 text-2xl font-semibold text-slate-100">{item.title}</h2>
                    </div>
                    <span className="rounded-full bg-slate-900/90 px-4 py-2 text-sm font-semibold text-slate-300">
                      {item.date}
                    </span>
                  </div>
                  <p className="mt-4 text-slate-400 leading-7">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.8rem] border border-slate-700/70 bg-slate-950/90 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Highlights</p>
              <ul className="mt-4 space-y-3 text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
                  Live event registration closes April 15.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
                  New clubs added to the community board this week.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
                  Explore campus wellness and mentorship programs.
                </li>
              </ul>
            </div>

            <div className="rounded-[1.8rem] border border-slate-700/70 bg-slate-950/90 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Quick actions</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200">View upcoming events</div>
                <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200">Join a new club</div>
                <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200">Share an announcement</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
