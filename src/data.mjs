// Demo content for the Hale Arden template. All names, copy and projects are fictional.
export const ASSETS = 'https://b468214e2f9f.blob.upstash.io';

export const studio = {
  name: 'Hale Arden',
  tagline: 'Architecture & Interiors',
  city: 'Lisbon',
  timeZone: 'Europe/Lisbon',
  email: 'studio@halearden.example',
  phone: '+351 210 000 000',
  address: ['Rua das Flores 18', '1200-195 Lisbon'],
  instagram: 'https://instagram.com/',
  linkedin: 'https://linkedin.com/',
  intro: 'We design calm, enduring buildings and interiors where light, material and proportion do the quiet work.',
  about: 'Hale Arden is a small practice of architects and interior designers. We take on a handful of projects each year so every detail, from the site plan to the door handle, is drawn by the people you meet on day one.',
};

export const categories = ['Residential', 'Multi-residential', 'Workplace', 'Hospitality'];

export const projects = [
  { slug: 'hillside-house', title: 'Hillside House', category: 'Residential', year: 2026, location: 'Sintra', size: '420 m²', status: 'Completed', image: 'hill-house', ratio: '16/9', gallery: ['courtyard', 'kitchen', 'stair'],
    summary: 'A long, low house folded into a grassy slope, with every room opening to the valley.',
    body: 'The brief asked for a home that would disappear into the landscape. We set the plan along the contour, buried the service spaces into the hill and gave the living rooms a single horizontal window that frames the trees.' },
  { slug: 'travertine-kitchen', title: 'Travertine Kitchen', category: 'Residential', year: 2025, location: 'Porto', size: '160 m²', status: 'Completed', image: 'kitchen', ratio: '4/5', gallery: ['bathroom', 'stair', 'courtyard'],
    summary: 'A double-height kitchen built around a single block of honed stone.',
    body: 'We removed a mezzanine to bring light deep into the plan, then placed a solid travertine island beneath the tallest window so the room is organised around one heavy, quiet object.' },
  { slug: 'corner-apartments', title: 'Corner Apartments', category: 'Multi-residential', year: 2025, location: 'Lisbon', size: '3,200 m²', status: 'Completed', image: 'corner-apartments', ratio: '3/4', gallery: ['tower', 'courtyard', 'kitchen'],
    summary: 'Twenty-four homes above a neighbourhood café, in a brick that matches the street.',
    body: 'Deep window reveals give each apartment shade and privacy while keeping the facade calm. The ground floor stays open to the street, with a café and shared bike room behind bronze frames.' },
  { slug: 'olive-courtyard', title: 'Olive Courtyard', category: 'Residential', year: 2024, location: 'Cascais', size: '310 m²', status: 'Completed', image: 'courtyard', ratio: '4/3', gallery: ['stair', 'bathroom', 'hill-house'],
    summary: 'A courtyard house planned around one old olive tree.',
    body: 'Board-formed concrete walls wrap a gravel court, and timber screens slide away so the living room and garden become one room for most of the year.' },
  { slug: 'quiet-stair', title: 'Quiet Stair', category: 'Residential', year: 2024, location: 'Lisbon', size: '95 m²', status: 'Completed', image: 'stair', ratio: '3/4', gallery: ['kitchen', 'courtyard', 'bathroom'],
    summary: 'A sculptural stair that turns a narrow townhouse into a lantern.',
    body: 'One curving concrete stair connects four floors under a new skylight. Everything else in the house was simplified so the stair and the light could lead.' },
  { slug: 'studio-on-the-avenue', title: 'Studio on the Avenue', category: 'Workplace', year: 2023, location: 'Lisbon', size: '540 m²', status: 'Completed', image: 'studio-office', ratio: '16/9', gallery: ['corner-apartments', 'kitchen', 'tower'],
    summary: 'A design studio with one long table and a window onto the plane trees.',
    body: 'We kept the original stone floor, added linen lighting and built a single 9-metre table so the whole team can work, review and eat in one place.' },
  { slug: 'sea-grass-house', title: 'Sea Grass House', category: 'Hospitality', year: 2023, location: 'Comporta', size: '12 suites', status: 'Completed', image: 'bathroom', ratio: '4/5', gallery: ['courtyard', 'hill-house', 'stair'],
    summary: 'Twelve guest suites in warm plaster and limestone, a short walk from the dunes.',
    body: 'Each suite has a carved stone basin and a small window to the grass. The palette is limited to three materials so the coast does the decorating.' },
  { slug: 'terrace-tower', title: 'Terrace Tower', category: 'Multi-residential', year: 2027, location: 'Porto', size: '11,800 m²', status: 'In progress', image: 'tower', ratio: '3/4', gallery: ['corner-apartments', 'studio-office', 'courtyard'],
    summary: 'A slender tower of pale precast concrete with a planted terrace on every floor.',
    body: 'The tower steps back from its heritage neighbours and gives each home a deep, planted terrace. Construction is under way, with completion planned for 2027.' },
];

export const process = [
  { n: '01', title: 'Listen', text: 'We start on site with you, measuring, photographing and asking how you want to live or work.' },
  { n: '02', title: 'Draw', text: 'Concept options in plan, section and model, narrowed down together until one idea feels inevitable.' },
  { n: '03', title: 'Detail', text: 'Every junction, joinery piece and light fitting is drawn, priced and agreed before work starts.' },
  { n: '04', title: 'Build', text: 'We stay on site through construction, so the finished building matches the drawings.' },
];

export const values = [
  { title: 'Fewer, better', text: 'A small number of projects each year, each led by a director.' },
  { title: 'Material first', text: 'Stone, timber, lime and brick that age well and need little upkeep.' },
  { title: 'Light as structure', text: 'We plan rooms around how daylight moves through them.' },
];

export const team = [
  { name: 'Inês Hale', role: 'Director, Architect', image: 'studio-office' },
  { name: 'Tomás Arden', role: 'Director, Interiors', image: 'kitchen' },
  { name: 'Mara Lind', role: 'Senior Architect', image: 'stair' },
  { name: 'Rui Costa', role: 'Project Architect', image: 'courtyard' },
];

export const awards = [
  { year: 2026, title: 'Residential Architecture — Shortlist', org: 'European Design Review' },
  { year: 2025, title: 'Interior of the Year', org: 'Iberian Interiors Awards' },
  { year: 2024, title: 'Small Project Prize', org: 'Lisbon Architecture Week' },
];

export const press = [
  { year: 2026, title: 'Houses that disappear', outlet: 'Habitat Quarterly' },
  { year: 2025, title: 'The stone kitchen', outlet: 'Interiors Journal' },
  { year: 2024, title: 'Ten studios to watch', outlet: 'Form & Place' },
];
