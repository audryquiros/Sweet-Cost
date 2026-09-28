import React from "react";

const PATHS = {
  dashboard: (<><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19V3"/></>),
  products: (<><path d="M3.5 7.5 12 3l8.5 4.5L12 12 3.5 7.5Z"/><path d="M3.5 7.5V17L12 21l8.5-4V7.5"/><path d="M12 12v9"/></>),
  supplies: (<><path d="M7 4h10"/><path d="M8 4v3l-2 3v7a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-7l-2-3V4"/><path d="M8 10h8"/></>),
  recipes: (<><path d="M6 3.5h8.5L18 7v13.5H6z"/><path d="M14.5 3.5V7H18"/><path d="M9 11h6M9 14.5h6M9 18h4"/></>),
  quotes: (<><path d="M5 4.5h14v15H5z"/><path d="M8 8h8M8 11.5h8M8 15h5"/><path d="M8 19.5v1"/></>),
  orders: (<><path d="M6 3.5h12v17H6z"/><path d="M9 3.5v3h6v-3"/><path d="m9 13 2 2 4-4"/></>),
  calendar: (<><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>),
  employees: (<><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.6-3.2 2.5-5 5.5-5s4.9 1.8 5.5 5"/><path d="M16 6.5a2.5 2.5 0 0 1 0 4.9M17 15.5c2 .7 3.2 2.1 3.5 4.5"/></>),
  settings: (<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l-1.8 1.8a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6v.5h-2.6V20a1.8 1.8 0 0 0-1.1-1.6 1.8 1.8 0 0 0-2 .4L7.4 17a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1.1H5.5v-2.6h.7a1.8 1.8 0 0 0 1.6-1.1 1.8 1.8 0 0 0-.4-2l1.8-1.8a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1.1-1.6v-.5h2.6v.5a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.4l1.8 1.8a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1.1h.7v2.6h-.7a1.8 1.8 0 0 0-1.6 1.1Z"/></>),
  profile: (<><circle cx="12" cy="8" r="3.5"/><path d="M5 20.5c.8-3.7 3.1-5.5 7-5.5s6.2 1.8 7 5.5"/></>),
  edit: (<><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></>),
  trash: (<><path d="M5 7h14M10 11v6M14 11v6M9 7V4h6v3M7 7l1 14h8l1-14"/></>),
  eye: (<><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>),
  plus: (<><path d="M12 5v14M5 12h14"/></>),
  close: (<><path d="m6 6 12 12M18 6 6 18"/></>),
  check: (<><path d="m5 12 4 4L19 6"/></>),
  search: (<><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 5 5"/></>),
  filter: (<><path d="M4 6h16M7 12h10M10 18h4"/></>),
  grid: (<><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>),
  list: (<><path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></>),
  chevronDown: (<path d="m6 9 6 6 6-6"/>),
  chevronUp: (<path d="m6 15 6-6 6 6"/>),
  arrowLeft: (<><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>),
  arrowRight: (<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>),
  clock: (<><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></>),
  phone: (<><path d="M7 4.5 9.5 7 8 9.5c1.1 2.3 3 4.2 5.3 5.3l2.5-1.5 2.5 2.5-1.8 3c-.5.8-1.5 1.1-2.4.8C8.6 17.4 6.6 15.4 4.4 9.9c-.3-.9 0-1.9.8-2.4L7 4.5Z"/></>),
  calculator: (<><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h2M14 18h2"/></>),
  money: (<><circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.5c-.5-1-1.4-1.5-2.6-1.5-1.5 0-2.5.8-2.5 1.8 0 2.8 5.3 1.1 5.3 4 0 1.1-1 2-2.6 2-1.2 0-2.2-.5-2.7-1.5M12 6.5v11"/></>),
  payment: (<><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 14h3"/></>),
  package: (<><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></>),
  truck: (<><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>),
  info: (<><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>),
  logout: (<><path d="M10 5H5v14h5"/><path d="M13 8l4 4-4 4M8 12h9"/></>),
  download: (<><path d="M12 4v11M8 11l4 4 4-4M5 20h14"/></>),
  upload: (<><path d="M12 20V9M8 13l4-4 4 4M5 4h14"/></>),
};

export default function Icon({ type, size = 18, strokeWidth = 1.8, className = "" }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[type] || PATHS.calendar}
    </svg>
  );
}
