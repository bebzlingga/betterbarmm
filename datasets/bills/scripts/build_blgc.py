#!/usr/bin/env python3
"""Write datasets/bills/blgc.json — the operative sections of the Bangsamoro
Local Governance Code of 2023, Bangsamoro Autonomy Act 49.

  https://parliament.bangsamoro.gov.ph/bta-acts/an-act-providing-for-the-bangsamoro-local-governance-code/

The Code is 605 sections. Read from the published act and transcribed here by
hand rather than parsed: the PDF is a scanned 304 pages, and what the
assistant needs from a section is the rule and not the prose around it.

Three fields do the work, and each is written for a reader that is not human:

  rule   the section as a rule, with its figures in it. The assistant quotes
         this and is not allowed to state a figure that was not in it, so
         "salary grade 27" and "not less than 40,000 pesos" either survive
         into the row or they are lost.
  terms  the words a question actually uses, which the Code never does —
         kagawad for a sangguniang barangay member, barangay captain for a
         punong barangay, amilyar for the real property tax, cedula for the
         community tax certificate.
  book   which of the four Books it is in, kept for the record.

Sections that only create an office, name a chapter or repeat a national rule
are left out; what is here is what somebody asks about.

    python3 datasets/bills/scripts/build_blgc.py
"""
import json, pathlib

SECTIONS = []

def S(n, heading, book, rule, terms=''):
    SECTIONS.append({'n': n, 'heading': heading, 'book': book,
                     'rule': ' '.join(rule.split()), 'terms': ' '.join(terms.split())})

# ---------------------------------------------------------------- Book I ----
S('1', 'Short title: the Bangsamoro Local Governance Code of 2023', 'I',
  'The Code is cited as the Bangsamoro Local Governance Code of 2023. It is '
  'Bangsamoro Autonomy Act 49, passed by the Bangsamoro Transition Authority '
  'on 28 September 2023 and running to 605 sections across four Books.',
  'blgc name cited short title what is the code called 2023')

S('2', 'Declaration of policy', 'I',
  'Decentralisation runs from the Bangsamoro Government down to its constituent '
  'local government units, gradually and systematically, under the principles of '
  'moral governance. National programs implemented in BARMM are subject to '
  'mandatory consultation and coordination with the Bangsamoro Government.',
  'policy purpose why autonomy decentralisation moral governance')

S('4', 'Scope of application', 'I',
  'The Code applies to all constituent provinces, cities, municipalities and '
  'barangays of the Bangsamoro Autonomous Region, and to Bangsamoro officials, '
  'offices and agencies to the extent it provides.',
  'who does it cover apply scope applies to')

S('5', 'Rules of interpretation', 'I',
  'Doubt about a power is resolved in favor of the local government unit and of '
  'the lower unit. A tax ordinance is construed strictly against the unit enacting '
  'it and liberally in favor of the taxpayer. Where no law or jurisprudence '
  'applies, resort may be had to the customs and traditions of the place.',
  'interpret doubt ambiguity customs traditions favor taxpayer')

S('6', 'Authority to create local government units', 'I',
  'Parliament may create, divide, merge, abolish or alter the boundaries of '
  'municipalities or barangays by law; a sangguniang panlalawigan or panlungsod '
  'may do the same for barangays by ordinance. Any of it takes effect only on a '
  'majority of votes cast in a plebiscite in the units directly affected.',
  'create new barangay municipality who can make split merge abolish plebiscite')

S('7', 'Creation and conversion', 'I',
  'A unit may be created or converted only on verifiable indicators: income '
  'certified by the Bureau of Local Government Finance, population certified by '
  'the Philippine Statistics Authority, and land area certified by the Ministry of '
  'Environment, Natural Resources and Energy.',
  'requirements criteria income population land area certify convert')

S('8', 'Division and merger', 'I',
  'A division must not drop the income, population or land area of any unit '
  'concerned below the minimum for its creation, and the income classification of '
  'the original unit must not fall below what it was before.',
  'divide split merge income class requirements')

S('10', 'Plebiscite requirement', 'I',
  'No creation, division, merger, abolition or substantial boundary change takes '
  'effect without a majority of the votes cast in a plebiscite. The Bangsamoro '
  'Electoral Office of the COMELEC conducts it within 120 days of the law or '
  'ordinance taking effect, unless another date is fixed.',
  'plebiscite vote referendum 120 days boundary change')

S('11', 'Seat of government', 'I',
  'The law creating a unit names the seat of government. A sanggunian may move it '
  'after a public hearing and a two-thirds vote of all its members, never outside '
  'the unit, not more than once every 20 years, and only with prior authorisation '
  'from the Office of the Chief Minister through the MILG.',
  'capital seat town hall move transfer poblacion 20 years')

S('12', 'Government centers', 'I',
  'Provinces, cities and municipalities shall endeavour to establish a government '
  'center where national, regional and local offices and GOCCs may be located, '
  'each bearing the cost of its own building.',
  'government center offices one place')

S('13', 'Naming of places and structures', 'I',
  'Nothing may be named after a living person, and no name may be changed oftener '
  'than once every 10 years. Parliament or the sangguniang panlalawigan names '
  'municipalities and component cities; a sanggunian names its own barangays, '
  'roads, schools and hospitals. Names of historical, cultural or ethnic '
  'significance may be changed only by unanimous vote and in consultation with the '
  'Bangsamoro Commission for the Preservation of Cultural Heritage.',
  'rename name street school hospital barangay living person change name')

S('14', 'Local public holidays', 'I',
  'A sanggunian may recommend to the Chief Minister that the founding anniversary '
  'of its locality be proclaimed a working or non-working public holiday, in '
  'consultation with the heritage commission, the labour ministry and local '
  'historical associations.',
  'holiday founding anniversary non-working day fiesta')

S('15', 'Beginning of corporate existence', 'I',
  'A new unit comes into corporate existence on the election and qualification of '
  'its chief executive and a majority of its sanggunian, or on their appointment by '
  'the Chief Minister, unless the creating law fixes another time.',
  'when does a new barangay municipality start exist officially')

S('17', 'General welfare', 'I',
  'Every unit exercises the powers expressly granted, those necessarily implied, '
  'and those essential to the general welfare — preserving culture, promoting '
  'health and nutrition, sanitation, clean water, safety, ecological balance, '
  'public morals, employment, and peace and order within its territory.',
  'general welfare powers what can my town do implied powers')

S('18', 'Devolved powers, functions, services and facilities', 'I',
  'Bangsamoro ministries shall gradually devolve basic services and facilities to '
  'local government units within five years of the Code taking effect, subject to a '
  'comprehensive assessment of each unit’s financial viability and technical '
  'capacity. Devolved services are funded primarily from the units’ share of '
  'national taxes and their own local revenues.',
  'devolution devolve transfer services five years ministries basic services')

S('19', 'Full devolution of Marawi, Cotabato City and Basilan', 'I',
  'Marawi City, Cotabato City and the province of Basilan — including its component '
  'municipalities and Lamitan City — continue to enjoy the full devolution status '
  'they already held. The Bangsamoro Government may still set up its own offices '
  'there to deliver its services.',
  'marawi cotabato city basilan lamitan full devolution special status')

S('20', 'Augmentation', 'I',
  'A Bangsamoro ministry or the next higher local government unit may provide or '
  'augment a basic service assigned to a lower unit where the service is not '
  'available or falls short of acceptable standards — provided the MILG or the '
  'higher unit works to capacitate the lower unit to deliver it alone.',
  'augment help support higher unit province takes over service')

S('21', 'Power to generate and apply resources', 'I',
  'Units may create their own sources of revenue, levy taxes and fees that accrue '
  'exclusively to them, take a just share in national taxes released automatically '
  'and directly, take an equitable share in the proceeds of national wealth within '
  'their territory, and acquire and dispose of property held in a proprietary '
  'capacity.',
  'revenue raise money taxes share national wealth')

S('22', 'Eminent domain', 'I',
  'A unit may expropriate private property for public use through its chief '
  'executive acting under an ordinance, only after a valid and definite offer was '
  'made and refused, and may take possession on filing the case and depositing at '
  'least 15% of the fair market value based on the current tax declaration. The '
  'court fixes the compensation on the value at the time of taking.',
  'expropriate expropriation take land eminent domain 15 percent deposit road widening')

S('23', 'Reclassification of lands', 'I',
  'A city or municipality may reclassify agricultural land by ordinance after '
  'public hearings, limited to 15% of total agricultural land for highly urbanised '
  'and independent component cities, 10% for component cities and first to third '
  'class municipalities, and 5% for fourth to sixth class municipalities. Failure '
  'to act on a complete application within three months is deemed approval.',
  'reclassify agricultural land convert residential commercial zoning percentage')

S('24', 'Closure and opening of roads', 'I',
  'A unit may close or open a local road, alley, park or square by ordinance; '
  'permanent closure needs two-thirds of all sanggunian members and an adequate '
  'substitute facility. No freedom park may be closed permanently without '
  'relocation. Streets may be closed temporarily for emergencies, fiestas, rallies '
  'or public works, and for flea or night markets by ordinance.',
  'close road street market night market fiesta block road permanently')

S('25', 'Corporate powers', 'I',
  'Every unit may sue and be sued, have a corporate seal, acquire and convey '
  'property, and enter into contracts. No contract may be entered into by the chief '
  'executive without prior sanggunian authorisation, and a legible copy must be '
  'posted at the capitol or the city, municipal or barangay hall.',
  'contract sign sue corporate seal post contract public')

S('26', 'Authority to negotiate and secure grants', 'I',
  'A local chief executive may, on sanggunian authority, negotiate and secure '
  'financial grants or donations in kind from local and foreign assistance agencies '
  'without clearance from any higher office, and must report the nature, amount and '
  'terms to the Office of the Chief Minister through the MILG within 30 days of '
  'signing.',
  'grant donation foreign aid funding ngo report 30 days')

S('27', 'Liability for damages', 'I',
  'Local government units and their officials are not exempt from liability for '
  'death or injury to persons or damage to property.',
  'liable liability sue damages injury')

S('29', 'Regional supervision over local government units', 'I',
  'The Chief Minister exercises general supervision directly over provinces, highly '
  'urbanised cities and independent component cities; through the province over '
  'component cities and municipalities; and through the city or municipality over '
  'barangays.',
  'supervision chain who supervises chief minister oversight')

S('32', 'Prior consultations required', 'I',
  'No project or program may be implemented without the consultations the Code '
  'requires, and where it may cause pollution, climate change, resource depletion '
  'or loss of forest cover, the prior approval of the sanggunian concerned must be '
  'obtained. Occupants may not be displaced without relocation and mitigation.',
  'consultation consult project displace relocate environment approval')

S('33', 'Powers over the Philippine National Police', 'I',
  'How far a local chief executive supervises and controls the police, fire and jail '
  'personnel assigned to the locality is governed by national law and the '
  'Bangsamoro Organic Law, not by this Code.',
  'police pnp control mayor fire jail')

S('34', 'Provincial relations with component cities and municipalities', 'I',
  'The province, through the governor, ensures its component cities and '
  'municipalities act within their powers. Highly urbanised cities and independent '
  'component cities are independent of the province.',
  'province supervise city municipality independent')

S('35', 'Review of executive orders', 'I',
  'The governor reviews executive orders of component city and municipal mayors, '
  'and the mayor reviews those of punong barangays. Copies go up within three days '
  'of issuance; failure to act within 30 days makes the order deemed consistent with '
  'law and valid. Copies are furnished to the MILG through the local government '
  'operations officer.',
  'executive order review governor mayor 30 days valid')

S('37', 'City and municipal supervision over barangays', 'I',
  'The city or municipality, through its mayor, exercises general supervision over '
  'its component barangays to keep their acts within their prescribed powers.',
  'mayor supervise barangay oversight')

S('38', 'Cooperative undertakings among local government units', 'I',
  'Units may group, consolidate or coordinate their efforts, services and resources '
  'by ordinance, contributing funds, real estate, equipment and personnel under a '
  'memorandum of agreement approved after a public hearing.',
  'joint project cooperate two towns share resources memorandum agreement')

S('39', 'Role of people’s and non-governmental organizations', 'I',
  'Units shall promote independent people’s and non-governmental organizations '
  'representing women, youth, workers, persons with disabilities and indigenous '
  'cultural communities as active partners in local autonomy, and may enter joint '
  'ventures with them and give them financial assistance.',
  'ngo civil society people organization partner assistance')

# ------------------------------------------ Book I, Title II: elective ------
S('42', 'Qualifications of elective local officials', 'I',
  'A candidate must be a Filipino citizen, a registered voter in the unit or '
  'district, a resident there for at least one year before election day, and able '
  'to read and write Filipino or a local language. Minimum ages on election day: 23 '
  'for governor, vice governor, sangguniang panlalawigan member, and mayor, vice '
  'mayor or sangguniang panlungsod member of a highly urbanised city; 21 for mayor '
  'or vice mayor of an independent component city, component city or municipality; '
  '18 for sangguniang panlungsod or bayan members, punong barangay and sangguniang '
  'barangay members; and 18 to 24 for the sangguniang kabataan.',
  'qualification age how old run for office candidate requirements residency '
  'mayor governor kagawad captain minimum age')

S('43', 'Mandatory training and capacity development', 'I',
  'Every newly elected local official must complete an eight-hour onboarding '
  'program on assuming office, run by the Bangsamoro Local Government Academy or '
  'an MILG-accredited provider, and attend continuing skills training within the '
  'first two years. Deliberately skipping it is a ground for disciplinary action '
  'and disqualifies the official from the immediately succeeding election until the '
  'training is completed. This applies starting with the May 2028 elections.',
  'training seminar mandatory onboarding eight hours newly elected disqualified 2028')

S('44', 'Components of the training programs', 'I',
  'The MILG, the Development Academy of the Bangsamoro, the BLGA and Mindanao State '
  'University jointly design a 32-hour mandatory and continuing program covering '
  'Bangsamoro culture, history and autonomy; leadership, local legislation, '
  'financial literacy, accountability and transparency; updates on regional '
  'governance; and conflict-sensitivity and peacebuilding.',
  'training content 32 hours curriculum peacebuilding conflict sensitivity')

S('45', 'Disqualifications', 'I',
  'Disqualified from running for any elective local post: those sentenced by final '
  'judgment for an offence involving moral turpitude or punishable by one year or '
  'more, within two years after serving sentence; those removed from office by an '
  'administrative case; those convicted of violating the oath of allegiance; dual '
  'citizens; fugitives from justice; permanent residents abroad; and — under '
  'subsection (g) — anyone related within the second civil degree of consanguinity '
  'or affinity, including spouses, to an incumbent local official running for '
  'office, who is barred from any elective position in the same province, city, '
  'municipality or barangay in the same election. Every candidate must declare in '
  'the certificate of candidacy that no such relationship exists. Where relatives '
  'run against each other for different positions the one seeking the lower office '
  'is disqualified; for the same position the Bangsamoro Electoral Office draws '
  'lots. Also disqualified: incumbents running outside their own unit, chief '
  'executives seeking the immediately lower position, those who skipped the '
  'mandatory training, and anyone declared insane. Subsection (g) applies starting '
  'with the May 2028 elections.',
  'anti dynasty political dynasty relatives family run together second degree '
  'brother sister spouse wife husband son daughter cousin disqualified '
  'certificate of candidacy 2028 banned')

S('46', 'Manner of election', 'I',
  'Governors, vice governors, mayors, vice mayors and punong barangays are elected '
  'at large. Regular sanggunian members of provinces, cities and municipalities are '
  'elected by district as provided by law; sangguniang barangay members are elected '
  'at large. Presidents of the leagues of sanggunian members, of the liga ng mga '
  'barangay and of the SK federation sit ex officio. There is one sectoral '
  'representative each from women, from workers, and from the urban poor, '
  'indigenous cultural communities, persons with disabilities or another sector.',
  'how elected at large by district sectoral representative ex officio')

S('47', 'Date of election', 'I',
  'Local elections are held every three years on the second Monday of May, unless '
  'otherwise provided by law.',
  'when election date second monday may how often three years next election')

S('48', 'Term of office', 'I',
  'Local elective officials serve three years, counted from noon of 30 June 2022. '
  'No official may serve more than three consecutive terms in the same position, '
  'and voluntarily giving up the office does not interrupt the count. Barangay and '
  'SK terms coincide with their counterparts outside the region.',
  'term limit three terms how long nine years reelection consecutive term of office')

S('49', 'Permanent vacancies in the offices of the chief executives', 'I',
  'If the governor or mayor leaves permanently the vice succeeds; if the vice '
  'cannot, the highest-ranking sanggunian member does. For a punong barangay it is '
  'the highest-ranking sangguniang barangay member. Successors serve only the '
  'unexpired term. Ranking is the proportion of votes a winning candidate got to '
  'the registered voters in the district at the last election, and ties are broken '
  'by drawing lots.',
  'succession vacancy dies died death resigns removed who takes over next in line ranking governor mayor')

S('50', 'Permanent vacancies in the sanggunian', 'I',
  'Vacancies not filled by automatic succession are filled by appointment: by the '
  'Chief Minister for a sangguniang panlalawigan or the sanggunian of a highly '
  'urbanised or independent component city; by the governor for a component city '
  'sanggunian or a sangguniang bayan; and by the mayor for a sangguniang barangay '
  'on the barangay’s recommendation. Except in barangays the appointee must come '
  'from the same political party as the member who caused the vacancy, with a '
  'nomination and certificate of membership from the party’s highest official — '
  'without them the appointment is void from the start.',
  'vacancy sanggunian council seat appoint replacement party nominee void')

S('51', 'Temporary vacancy in the office of the local chief executive', 'I',
  'A chief executive traveling or on leave may designate an officer-in-charge in '
  'writing for no more than three days, with powers confined to administration. '
  'Where the incapacity is legal, including suspension, or the designation runs past '
  'three days, the vice — or the highest-ranking sanggunian member — automatically '
  'takes over on the fourth day, though the power to appoint, suspend or dismiss '
  'employees comes only after 30 working days.',
  'officer in charge oic acting mayor travel leave three days vice takes over')

S('54', 'Temporary vacancy due to failure of elections', 'I',
  'Where a failure of elections leaves a province, city or municipality without an '
  'official past noon of 30 June, the Chief Minister designates an officer-in-charge '
  'from among the unit’s own appointive officials; for barangays the MILG '
  'Minister does. The designation is based on merit and fitness and lasts until a '
  'duly elected official is proclaimed.',
  'failure of elections no winner officer in charge appointed')

S('55', 'Approval of leaves of absence', 'I',
  'Leaves of governors and of mayors of highly urbanised and independent component '
  'cities are approved by the Chief Minister; of a vice governor or vice mayor by '
  'the chief executive; of component city and municipal mayors by the governor; of '
  'a punong barangay by the mayor; and of sangguniang barangay members by the punong '
  'barangay. A leave not acted on within five working days is deemed approved.',
  'leave vacation absence approve five days deemed approved')

S('56', 'Local legislative power', 'I',
  'Legislative power is exercised by the sangguniang panlalawigan for the province, '
  'the sangguniang panlungsod for the city, the sangguniang bayan for the '
  'municipality, and the sangguniang barangay for the barangay.',
  'who makes laws ordinance legislative council')

S('57', 'Presiding officer', 'I',
  'The vice governor presides over the sangguniang panlalawigan, the vice mayor over '
  'the panlungsod or bayan, and the punong barangay over the sangguniang barangay. '
  'The presiding officer votes only to break a tie, and a vice governor or vice '
  'mayor may not chair any regular standing committee.',
  'presiding officer who presides vote tie chair committee vice mayor')

S('58', 'Internal rules of procedure', 'I',
  'Every sanggunian adopts or updates its rules within 90 days of its members being '
  'elected. Standing committees must include appropriations, women and family, '
  'human rights, youth and sports development, environmental protection, and '
  'cooperatives. A member absent without justifiable cause for four consecutive '
  'sessions may be censured, suspended for up to 60 days or expelled, with '
  'suspension or expulsion needing two-thirds of all members; a member convicted by '
  'final judgment to at least one year for moral turpitude is automatically expelled.',
  'rules of procedure committees absences expel suspend censure two thirds')

S('59', 'Full disclosure of financial and business interests', 'I',
  'Every sanggunian member must disclose business and financial interests on '
  'assuming office, and must disclose in writing any business, financial or '
  'professional relationship — or any relation by affinity or consanguinity within '
  'the fourth civil degree — with anyone affected by a measure, before taking part '
  'in the deliberations on it. The disclosure forms part of the record.',
  'conflict of interest disclose declare relative fourth degree abstain')

S('60', 'Sessions', 'I',
  'A sangguniang panlalawigan, panlungsod or bayan meets at least once a week and a '
  'sangguniang barangay at least twice a month. Sessions are open to the public '
  'unless a majority orders otherwise for security, decency or morality, and no two '
  'sessions may be held in a single day. Special sessions need 24 hours’ written '
  'notice with a specific agenda. A sanggunian may conduct its sessions in a local '
  'language, with the minutes translated into English or Tagalog.',
  'session meeting how often weekly public local language translate minutes agenda')

S('61', 'Quorum', 'I',
  'A majority of all members elected and qualified — including sectoral and ex '
  'officio members, and counting the vice governor, vice mayor or punong barangay — '
  'is a quorum. Where there is none the presiding officer may compel attendance, and '
  'an absent member may be arrested by a designated member assisted by police and '
  'produced at the session. Members absent without cause for four consecutive '
  'sessions and those under preventive suspension are not counted in determining a '
  'quorum.',
  'quorum how many members needed majority arrest absent')

S('62', 'Approval of ordinances', 'I',
  'An ordinance goes to the governor or mayor, who signs every page or vetoes it '
  'with written objections. The sanggunian may override a veto by two-thirds of all '
  'its members. A chief executive has 15 days in a province and 10 days in a city '
  'or municipality to act, after which the ordinance is deemed approved. Barangay '
  'ordinances are signed by the punong barangay on approval by a majority of all '
  'sangguniang barangay members.',
  'ordinance approve sign veto override 15 days 10 days deemed approved')

S('63', 'Veto power of the local chief executive', 'I',
  'A chief executive may veto an ordinance only on the ground that it is ultra '
  'vires or prejudicial to public welfare, stating reasons in writing, and may veto '
  'particular items of an appropriations ordinance, a development plan resolution, '
  'or an ordinance creating liability. An ordinance may be vetoed only once, and '
  'two-thirds of all members override it. Vetoed budget items leave last year’s '
  'corresponding items deemed reenacted.',
  'veto item veto override mayor governor reject ordinance')

S('64', 'Provincial review of component city and municipal ordinances', 'I',
  'Approved ordinances and development plan resolutions go to the sangguniang '
  'panlalawigan within three days. It has 30 days to examine them, and may declare '
  'one invalid in whole or in part for exceeding the lower sanggunian’s powers. '
  'No action within 30 days means the ordinance is presumed consistent with law and '
  'valid.',
  'province review ordinance 30 days invalid presumed valid')

S('65', 'Review of barangay ordinances', 'I',
  'A sangguniang barangay furnishes its ordinances to the sangguniang panlungsod or '
  'bayan within 10 days of enactment. Failure to act within 30 days of receipt is '
  'approval; if found inconsistent with law or with city or municipal ordinances, '
  'they are returned with comments and their effectivity is suspended until revised.',
  'barangay ordinance review approve 30 days suspend')

S('67', 'Effectivity of ordinances', 'I',
  'Unless it says otherwise, an ordinance takes effect 10 days after a copy is '
  'posted on the bulletin board at the capitol or the city, municipal or barangay '
  'hall and in at least two other conspicuous places. The secretary must post it '
  'within five days of approval. The gist of every penal ordinance is published in a '
  'newspaper of general circulation in the province, and the text is disseminated in '
  'the language understood by most people in the unit.',
  'when does an ordinance take effect posting publish 10 days penal')

S('68', 'Online availability of ordinances', 'I',
  'Local government units shall, as far as practicable, maintain an official website '
  'or social media accounts for posting all approved ordinances and resolutions or '
  'their gist.',
  'website online post ordinance social media internet')

S('69', 'The Bangsamoro Register of Ordinances', 'I',
  'The MILG establishes and maintains the Bangsamoro Register of Ordinances as the '
  'repository of every ordinance enacted by a sanggunian and filed with the local '
  'government operations officer. The Register must be digital, work online, and be '
  'accessible to the public.',
  'register of ordinances database online public repository search ordinances milg')

S('70', 'Grounds for disciplinary action', 'I',
  'An elective local official may be disciplined, suspended or removed for '
  'disloyalty to the Republic; culpable violation of the Constitution; dishonesty, '
  'oppression, misconduct in office, gross negligence or dereliction of duty; an '
  'offence involving moral turpitude or punishable by at least prision mayor; abuse '
  'of authority; unauthorised absence for 15 consecutive working days, except for '
  'sanggunian members; and acquiring foreign citizenship or residence. Removal can '
  'be ordered only by the proper court.',
  'discipline remove suspend complaint misconduct grounds absent corruption')

S('71', 'Jurisdiction over administrative complaints', 'I',
  'A verified complaint against an elective official of a province, highly urbanised '
  'city or independent component city is filed with the Office of the Chief '
  'Minister; against a component city or municipal official with the sangguniang '
  'panlalawigan; and against a barangay official with the sangguniang panlungsod or '
  'bayan. The OCM may take a case itself where a fair and just resolution is '
  'unlikely before the sanggunian with jurisdiction.',
  'where to file complaint against mayor governor kagawad captain jurisdiction')

S('72', 'Notice of hearing', 'I',
  'The respondent is notified within seven days of filing and has a non-extendible '
  '15 days to submit a verified answer. The hearing and investigation begin within '
  '10 days of receiving the answer.',
  'complaint notice answer hearing deadline days')

S('74', 'Prohibited period', 'I',
  'No investigation may be held within the 90 days immediately before a local '
  'election, and no preventive suspension may be imposed in that period. A '
  'suspension imposed earlier is automatically lifted when the period starts.',
  'election period 90 days no suspension investigation ban')

S('75', 'Preventive suspension', 'I',
  'Preventive suspension is imposed by the Chief Minister for a provincial, highly '
  'urbanised or independent component city official, by the governor for a component '
  'city or municipal official, and by the mayor for a barangay official — only after '
  'the issues are joined, where the evidence of guilt is strong. No single '
  'suspension may run beyond 60 days, and no official may be preventively suspended '
  'more than 90 days within a single year on the same grounds. The case must end '
  'within 120 days of formal notice. Abuse of the power is punished as abuse of '
  'authority.',
  'preventive suspension 60 days 90 days suspend mayor how long')

S('76', 'Salary of respondent pending suspension', 'I',
  'An official preventively suspended receives no salary or compensation during the '
  'suspension, but is paid in full, including emoluments accruing, on exoneration '
  'and reinstatement.',
  'salary during suspension pay back pay exonerated')

S('78', 'Form and notice of decision', 'I',
  'The investigation ends within 90 days and the decision is rendered within 30 days '
  'after. Suspension may not exceed the unexpired term or six months for each '
  'administrative offence, and does not bar the official from running again. '
  'Removal from office as a result of an administrative investigation bars the '
  'respondent from candidacy for any elective position.',
  'penalty decision suspension six months removal bars candidacy run again')

S('79', 'Administrative appeals', 'I',
  'Decisions may be appealed within 30 days of receipt — to the sangguniang '
  'panlalawigan from a component city or municipal sanggunian, and to the Office of '
  'the Chief Minister from a sangguniang panlalawigan or the sanggunian of a highly '
  'urbanised or independent component city. Decisions of the OCM are final and '
  'executory.',
  'appeal decision 30 days final executory')

S('80', 'Execution pending appeal', 'I',
  'An appeal does not stop a decision from being executed. A respondent who wins on '
  'appeal is treated as having been preventively suspended during it, and on '
  'exoneration is paid salary and emoluments for the period.',
  'appeal execution pending removed while appealing back pay')

S('82', 'Initiation of the recall process', 'I',
  'A recall petition must be signed by registered voters of the unit: at least 25% '
  'where the voting population is under 20,000; 20% where it is 20,000 to 75,000, '
  'never fewer than 5,000; 15% where it is 75,000 to 300,000, never fewer than '
  '15,000; and 10% where it is over 300,000, never fewer than 45,000. The COMELEC '
  'through the Bangsamoro Electoral Office certifies sufficiency within 15 days, '
  'and the petition is published weekly for three weeks and posted for 10 to 20 '
  'days.',
  'recall petition signatures percentage remove official voters oust recalled')

S('83', 'Election on recall', 'I',
  'The recall election is set no later than 30 days after the procedure is completed '
  'for barangay, city or municipal officials, and 45 days for provincial officials. '
  'The official sought to be recalled is automatically a candidate.',
  'recall election date 30 days 45 days automatic candidate')

S('84', 'Effectivity of recall', 'I',
  'A recall takes effect only on the election and proclamation of a successor who '
  'received the highest number of votes. If the official sought to be recalled wins, '
  'confidence is affirmed and they stay in office.',
  'recall result wins stays effective successor')

S('85', 'Prohibition from resignation', 'I',
  'An official sought to be recalled may not resign while the recall process is in '
  'progress.',
  'resign during recall cannot quit')

S('86', 'Limitations on recall', 'I',
  'An official may be the subject of a recall election only once during a term, and '
  'no recall may take place within one year of assuming office or within the year '
  'immediately preceding a regular local election.',
  'recall limit once per term one year cannot recall when recalled')

# ------------------------------- Book I, Titles III-XII: HR, local bodies ----
S('87', 'Organizational structure and staffing pattern', 'I',
  'Every unit designs its own organizational structure and staffing pattern to suit '
  'its service requirements and financial capability, within the minimum standards '
  'the Civil Service Commission prescribes.',
  'plantilla structure staffing hire positions organization')

S('88', 'Responsibility for human resources', 'I',
  'The chief executive takes all personnel actions under the civil service '
  'provisions and the Bangsamoro Civil Service Code, and may hire emergency or '
  'casual workers on a daily wage or piecework basis through job orders without CSC '
  'approval — for no more than six months.',
  'hiring casual job order contractual six months emergency workers')

S('90', 'Limitation on appointments', 'I',
  'No person may be appointed to the career service of a local government if '
  'related within the fourth civil degree of consanguinity or affinity to the '
  'appointing or recommending authority.',
  'nepotism relative hire appoint fourth degree family member job')

S('91', 'Public notice of vacancy; personnel selection board', 'I',
  'A vacant career position must be posted in at least three conspicuous public '
  'places in the unit for at least 15 days. Every province, city and municipality '
  'has a personnel selection board headed by the chief executive, with a CSC '
  'representative and the personnel officer as ex officio members.',
  'job vacancy posting 15 days selection board hiring')

S('92', 'Recruitment and selection', 'I',
  'Employment in a local government unit is open to all qualified citizens, with '
  'preference given to bona fide residents of the locality.',
  'preference residents local hiring jobs')

S('94', 'Resignation of elective local officials', 'I',
  'A resignation takes effect only on acceptance — by the Chief Minister for '
  'governors, vice governors and mayors and vice mayors of highly urbanised and '
  'independent component cities; by the governor for component city and municipal '
  'mayors and vice mayors; by the sanggunian for its own members; and by the mayor '
  'for barangay officials. It is deemed accepted if not acted on within 15 working '
  'days.',
  'resign resignation quit accepted 15 days')

S('99', 'Disciplinary jurisdiction over appointive officials', 'I',
  'A local chief executive may remove, demote, suspend for up to one year without '
  'pay, fine up to six months’ salary, or reprimand subordinate officials and '
  'employees. A suspension of 30 days or less is final; anything heavier may be '
  'appealed to the Civil Service Commission, which decides within 30 days.',
  'discipline employee suspend fire fine appeal csc')

S('101', 'Prohibited business and pecuniary interest', 'I',
  'No local official or employee may engage in a business transaction with their '
  'own unit or one they supervise, hold an interest in a cockpit or other licensed '
  'game, buy real estate forfeited to the unit for unpaid taxes, act as surety for '
  'anyone contracting with the unit, or use public property for private purposes. '
  'Doing any of it is a ground for discipline and does not bar criminal charges.',
  'conflict of interest business with own town cockpit surety corruption')

S('102', 'Practice of profession', 'I',
  'Governors and city and municipal mayors may not practice a profession or hold '
  'another occupation. Sanggunian members may, outside session hours, but lawyers '
  'among them may not appear against the government, collect fees in administrative '
  'cases involving their own unit, or use public property. Doctors may practice '
  'during office hours only in emergencies and without compensation.',
  'practice law medicine lawyer doctor mayor sideline second job')

S('103', 'Statement of assets and liabilities', 'I',
  'Local officials and employees file sworn statements of assets, liabilities and '
  'net worth, together with lists of relatives within the fourth civil degree in '
  'government service, their financial and business interests, and personal data '
  'sheets.',
  'saln assets declare wealth relatives in government')

S('104', 'Oath of office and oath of moral governance', 'I',
  'Every elective and appointive local official subscribes to an oath or affirmation '
  'of office on assuming it, and may take it before the holy book of their own '
  'religious affiliation. They also take the oath of moral governance under the '
  'Bangsamoro Administrative Code.',
  'oath swear in holy book quran bible moral governance take office')

S('105', 'Partisan political activity', 'I',
  'No local official or employee in the career civil service may take part in '
  'partisan political activity beyond voting, though they may express views and name '
  'candidates they support. Elective officials may campaign, but may not solicit '
  'contributions from subordinates.',
  'campaign politics employees partisan solicit contributions')

S('106', 'Appointment of officials; candidates who lost', 'I',
  'No elective or appointive local official may hold another government office. '
  'Except in barangay elections, a losing candidate may not be appointed to any '
  'government office or GOCC within one year of the election.',
  'losing candidate appointed one year ban another office')

S('107', 'Additional or double compensation', 'I',
  'No local official or employee may receive additional, double or indirect '
  'compensation unless a law authorises it, nor accept any present, office or title '
  'from a foreign government without Parliament’s consent. Pensions and '
  'gratuities are not double compensation.',
  'double compensation extra pay allowance gift foreign')

S('108', 'Permission to leave station', 'I',
  'Appointive officials traveling on official business need written permission from '
  'their chief executive, deemed given if not acted on within four working days. '
  'Component city and municipal mayors need the governor’s permission to leave '
  'the province. Travel abroad is reported to the sanggunian, and where it runs past '
  'three months, falls in an emergency, or uses public funds, it needs OCM approval '
  'through the MILG.',
  'travel abroad permission leave station official trip four days')

S('109', 'Annual report', 'I',
  'On or before 31 March each year every local chief executive submits an annual '
  'report to the sanggunian and the MILG on the socio-economic, political and peace '
  'and order conditions of the unit for the preceding calendar year.',
  'annual report march 31 socio economic peace and order')

S('110', 'Local school boards', 'I',
  'Every province, city and municipality has a school board co-chaired by the chief '
  'executive and the schools division superintendent, with the Madaris division '
  'superintendent, the sanggunian education committee chair, the treasurer, the SK '
  'federation representative, the PTA federation president, and elected teacher and '
  'non-academic personnel representatives as members. Student councils are '
  'represented as far as practicable.',
  'school board education deped madaris members who sits')

S('111', 'Functions of local school boards', 'I',
  'The board determines the annual supplementary budget for public schools from the '
  'Special Education Fund, authorises the treasurer to disburse it, advises the '
  'sanggunian on educational matters, recommends changes to school names, and is '
  'consulted on the appointment of division superintendents and school principals.',
  'school board powers sef budget schools principal appointment')

S('112', 'School board budget priorities', 'I',
  'The annual school board budget gives priority to building, repairing and '
  'maintaining school buildings including Madaris; extension classes; sports at '
  'division, district, municipal and barangay level; teacher and student training; '
  'early childhood care and development; feeding for undernourished children in day '
  'care, kindergarten and elementary schools; mental and physical wellbeing '
  'programs; and special education for learners with disability.',
  'sef spending school building feeding sports madaris special education')

S('114', 'Local health boards', 'I',
  'Every province, city and municipality has a health board chaired by the chief '
  'executive with the health officer as vice chair, plus the sanggunian health '
  'committee chair, a private sector or NGO representative, and a Ministry of Health '
  'representative. It proposes annual budgets for health facilities and advises the '
  'sanggunian on health matters.',
  'health board members who sits hospital clinic budget')

S('117', 'Direct supervision by the Minister of Health', 'I',
  'In epidemics, pestilence and other widespread public health dangers the Minister '
  'of Health may, on the Chief Minister’s direction and in consultation with the '
  'unit, temporarily assume direct supervision and control of health operations for '
  'the duration of the emergency — never more than a cumulative six months without '
  'the unit’s concurrence.',
  'epidemic pandemic takeover health emergency six months')

S('118', 'Local development councils', 'I',
  'Every unit must have a comprehensive multi-sectoral development plan — a physical '
  'framework plan, a comprehensive development plan and an investment program — '
  'initiated by its development council and approved by its sanggunian.',
  'development plan council cdp investment program planning')

S('119', 'Composition of local development councils', 'I',
  'The barangay council is headed by the punong barangay; the city or municipal '
  'council by the mayor with all punong barangays as members; the provincial council '
  'by the governor with all mayors. Non-governmental organizations must hold not '
  'less than one fourth of the seats of a fully organized council, a member of '
  'Congress and a Member of Parliament or their representatives sit on each, at '
  'least 40% of members should be women, and an indigenous peoples representative is '
  'a mandatory member where IPs are at least 5% of the population or a recognized '
  'native title lies within the unit.',
  'development council members ngo one fourth 40 percent women indigenous')

S('121', 'Functions of local development councils', 'I',
  'Provincial, city and municipal councils formulate long-term, medium-term and '
  'annual socio-economic plans, the public investment programs, and local '
  'investment incentives, and appraise, prioritize, monitor and evaluate projects. '
  'A barangay development council mobilises people’s participation, prepares '
  'the barangay development plan, monitors projects, and acts as the barangay '
  'disaster risk reduction and management council.',
  'development council what it does plan monitor barangay drrm')

S('122', 'Meetings of local development councils', 'I',
  'A local development council meets at least once every six months, or as often as '
  'necessary.',
  'development council meeting how often six months')

S('128', 'Local peace and order council', 'I',
  'Every province, city and municipality has a local peace and order council under '
  'the national executive orders. It may also create ad hoc bodies to settle '
  'disputes or rido within the unit, composed of respected members of the community '
  'such as traditional leaders, religious leaders, women and others whose '
  'involvement makes a settlement likelier.',
  'peace and order council rido clan feud settle dispute traditional leaders')

S('129', 'Local disaster risk reduction and management council', 'I',
  'Every province, city and municipality has a local DRRM council with the '
  'composition and functions set by the national disaster law, and as far as '
  'practicable at least 40% of its membership shall be women.',
  'drrm disaster council women 40 percent calamity')

S('130', 'Other local councils', 'I',
  'Every province, city and municipality — and as far as practicable every barangay '
  '— shall establish councils for the protection of children, against drug abuse, '
  'for youth development, for women’s development, for culture and arts, for '
  'the elderly, for persons with disabilities, and for internally displaced persons.',
  'councils children drugs youth women culture elderly pwd idp displaced')

S('131', 'Autonomous special economic zones', 'I',
  'An autonomous special economic zone may be established by law in selected areas '
  'of BARMM only with the concurrence of the local government units included in it.',
  'economic zone ecozone special area consent')

S('132', 'Mandatory representation of indigenous peoples', 'I',
  'Indigenous peoples are guaranteed representation in the local policy-making '
  'bodies of Bangsamoro local government units where they are at least 5% of the '
  'unit’s population but hold not more than 50% of its elective offices, or '
  'where a native title recognized by the Ministry of Indigenous Peoples’ '
  'Affairs lies within the unit. Selection follows guidelines issued jointly by '
  'MIPA and the MILG, upholding their own customs and traditions.',
  'indigenous peoples ip representation seat mandatory five percent native title')

S('133', 'Mandatory representation of settler communities', 'I',
  'Settler communities are guaranteed representation in the local policy-making '
  'bodies of Bangsamoro local government units where they are at least 5% of the '
  'population but hold not more than 50% of its elective offices, under guidelines '
  'issued by the MILG.',
  'settler communities christian migrant representation seat mandatory five percent')

S('135', 'Settlement of boundary disputes', 'I',
  'Boundary disputes are settled amicably where possible: between barangays of the '
  'same city or municipality by its sanggunian; between barangays of different '
  'cities or municipalities in one province by the sangguniang panlalawigan; between '
  'municipalities of the same province by the sangguniang panlalawigan; and between '
  'provinces, or a province and an independent component or highly urbanised city, '
  'jointly by the sanggunians concerned. A dispute with a unit outside BARMM goes '
  'to the higher sanggunians of both at the same level, with recourse to the courts '
  'if no settlement is possible.',
  'boundary dispute border barangay land conflict which town owns')

S('137', 'Failure to arrive at an amicable settlement', 'I',
  'If the sanggunian fails to settle a boundary dispute within 60 days of referral '
  'it certifies the failure, and must then try the dispute formally and decide '
  'within 60 days of that certification.',
  'boundary dispute 60 days certification decide')

S('138', 'Appeal on boundary disputes', 'I',
  'A party may take the sanggunian’s decision to the regional trial court with '
  'jurisdiction over the disputed area, which decides within one year. Pending final '
  'resolution the status quo before the dispute is maintained for all legal '
  'purposes.',
  'boundary appeal court rtc one year status quo')

S('139', 'Local initiative', 'I',
  'Local initiative is the legal process by which the registered voters of a local '
  'government unit may directly propose, enact or amend an ordinance.',
  'initiative people propose ordinance directly citizens')

S('141', 'Procedure in local initiative', 'I',
  'Not fewer than 1,000 registered voters in a province or city, 100 in a '
  'municipality or 50 in a barangay may petition the sanggunian to adopt, enact, '
  'repeal or amend an ordinance. If it does not act favorably within 30 days the '
  'proponents may invoke initiative, and then have 90 days in a province or city, 60 '
  'in a municipality and 30 in a barangay to gather the required signatures before '
  'the election registrar.',
  'initiative how many signatures 1000 100 50 petition ordinance')

S('143', 'Limitations on local initiatives', 'I',
  'Local initiative may not be exercised more than once a year, extends only to '
  'subjects within the sanggunian’s power to enact, and is cancelled if the '
  'sanggunian adopts the proposition before the vote.',
  'initiative limits once a year cancel')

S('144', 'Limitations upon the sanggunian', 'I',
  'A proposition approved by initiative or referendum may not be repealed, modified '
  'or amended by the sanggunian within six months, and for three years afterwards '
  'only by a three-fourths vote of all its members — in barangays the protected '
  'period is 18 months.',
  'initiative result repeal six months three fourths 18 months')

S('145', 'Local referendum', 'I',
  'Local referendum is the process by which registered voters may approve, amend or '
  'reject an ordinance the sanggunian enacted. The COMELEC through the Bangsamoro '
  'Electoral Office holds it within 60 days in a province or city, 45 days in a '
  'municipality and 30 days in a barangay, and certifies and proclaims the result.',
  'referendum reject ordinance vote 60 days 45 days 30 days')

# ------------------------------------------- Book II: taxation and money ----
S('148', 'Power to create sources of revenue', 'II',
  'Each unit may create its own sources of revenue and levy taxes, fees and charges '
  'subject to the Bangsamoro Organic Law and consistent with equalisation, equity, '
  'accountability, administrative simplicity, harmonisation, economic efficiency and '
  'fiscal autonomy. What it collects accrues exclusively to it.',
  'taxing power revenue levy taxes own money')

S('151', 'Streamlined licensing and the Business One-Stop Shop', 'II',
  'Units must streamline permits, licenses and clearances, establish a Business '
  'One-Stop Shop, and adopt simplified requirements that cut red tape, with a '
  'standardised business permit and licensing system.',
  'business permit one stop shop boss red tape license apply')

S('152', 'Fundamental principles of local taxation', 'II',
  'Local taxation must be uniform and equitable, consider the taxpayer’s ability '
  'to pay, avoid direct duplicate taxation, be levied only for public purposes, and '
  'never be unjust, excessive, oppressive or confiscatory. It must take into '
  'consideration the principles of Shari’ah as may be relevant. Collection may '
  'in no case be let or delegated to a private person.',
  'tax principles fair shariah islamic equitable ability to pay private collector')

S('153', 'Avoidance of riba', 'II',
  'In lieu of the Code’s interest provisions, a local sanggunian may pursue '
  'Shari’ah-compliant policies to govern unpaid or late payments of taxes, fees, '
  'charges and other revenues. Riba is any prohibited increase in a financial '
  'obligation as defined by the Shari’ah.',
  'riba interest islamic shariah penalty late payment haram no interest')

S('156', 'Common limitations on local taxing powers', 'II',
  'Units may not levy income tax except on banks and financial institutions, '
  'documentary stamp tax, estate or inheritance taxes, capital gains tax, '
  'donor’s tax, customs duties, taxes on goods passing through their territory, '
  'taxes on agricultural and aquatic products sold by marginal farmers or fishers, '
  'excise taxes or taxes on petroleum products, VAT or percentage taxes except as '
  'provided, taxes on transport contractors and common carriers, motor vehicle '
  'registration fees except for tricycles, taxes on exported products, taxes on '
  'registered cooperatives, or taxes on the national government, the Bangsamoro '
  'Government or other local government units. Enterprises certified by the '
  'Bangsamoro Board of Investments are exempt for six years as pioneer and four '
  'years as non-pioneer.',
  'cannot tax limits prohibited income vat excise petroleum cooperative exempt bboi')

S('158', 'Tax on transfer of real property ownership', 'II',
  'A province may tax the sale, donation, barter or any transfer of real property at '
  'not more than 50% of 1% of the consideration or the fair market value, whichever '
  'is higher. Transfers under the agrarian reform law are exempt, and the tax is '
  'paid within 60 days of the deed or the decedent’s death.',
  'transfer tax sell land property buy house rate 60 days')

S('160', 'Franchise tax', 'II',
  'A province may tax a business enjoying a franchise at not more than 50% of 1% of '
  'the gross annual receipts realized within its territory, notwithstanding any '
  'exemption granted by law.',
  'franchise tax utility telecom rate')

S('161', 'Permits for sand, gravel and quarry resources', 'II',
  'The provincial governor issues permits to extract sand, gravel and other quarry '
  'resources over an area of not more than five hectares, on the recommendation of '
  'the city or municipal mayor and under a provincial ordinance. Permits run five '
  'years, renewable to a total of 25. The environment ministry issues permits for '
  'areas over five and up to 20 hectares.',
  'quarry permit sand gravel five hectares governor 25 years')

S('162', 'Tax on sand, gravel and other quarry resources', 'II',
  'Where the province issued the permit it may levy not more than 10% of the fair '
  'market value per cubic meter of quarry resources taken from public lands or '
  'public waters. The proceeds go 30% to the province, 30% to the component city or '
  'municipality, and 40% to the barangay where they were extracted.',
  'quarry tax sand gravel share barangay 40 percent 10 percent')

S('163', 'Professional tax', 'II',
  'A province may levy an annual professional tax on each person practicing a '
  'profession requiring government examination, in no case more than ₱1,300. The '
  'ceiling may be raised once every three years on the consumer price index. It is '
  'payable by 31 January, and a professional who has paid may practice anywhere in '
  'the Philippines without further local tax. Professionals employed exclusively in '
  'government are exempt.',
  'professional tax lawyer doctor engineer nurse cpa how much 1300 january')

S('164', 'Amusement tax', 'II',
  'A province may levy an amusement tax of not more than 10% of gross admission '
  'receipts on theatres, cinemas, concert halls, circuses, boxing stadia and other '
  'places of amusement, shared equally by the province and the municipality where '
  'they are. Operas, concerts, dramas, recitals, art exhibitions, flower shows, '
  'musical programs and literary presentations are exempt — pop, rock and similar '
  'concerts are not.',
  'amusement tax cinema concert boxing 10 percent exempt')

S('165', 'Annual fixed tax on delivery trucks and vans', 'II',
  'A province may levy an annual fixed tax of not more than ₱2,200 on every truck '
  'or van used to deliver sweetened beverages, tobacco products and other goods the '
  'sanggunian determines, and a higher tax of not more than ₱6,600 on vehicles '
  'delivering distilled spirits, wines and fermented liquors. The ceiling may be '
  'raised once every three years on the consumer price index.',
  'delivery truck tax van beer liquor tobacco 2200 6600')

S('167', 'Municipal tax on business', 'II',
  'A municipality may tax manufacturers and distillers on a graduated schedule '
  'rising to ₱24,375 at ₱6.5 million of gross receipts and not more than 37½% '
  'of 1% above it; wholesalers and dealers to ₱10,000 at ₱2 million and not more '
  'than 50% of 1% above; retailers at 2% on gross receipts of ₱400,000 or less and '
  '1% above; contractors on a schedule to ₱11,500 and not more than 50% of 1% '
  'above; banks and financial institutions at not more than 50% of 1%, excluding '
  'duly registered Islamic banks; peddlers at not more than ₱50 a year; and any '
  'other business at not more than 2% of gross receipts. Exporters and dealers in '
  'essential commodities — rice, corn, flour, meat, cooking oil and gas, laundry '
  'soap, medicine, farm inputs, feeds, school supplies and cement — pay not more '
  'than half those rates.',
  'business tax municipality rate retailer wholesaler manufacturer contractor '
  'bank islamic bank peddler essential goods how much')

S('172', 'Fishery rentals, fees and charges', 'II',
  'Municipalities have the exclusive authority to grant fishery privileges in '
  'municipal waters. Registered organizations and cooperatives of marginal fishers '
  'have the preferential right to erect fish corrals and aquatic beds; marginal '
  'fishers may gather fry and fish with nets, traps and traditional gear such as '
  'payao free of any charge; and the sangguniang bayan issues licenses for fishing '
  'vessels of three tons or less.',
  'fishing rights municipal waters fish corral license boat three tons marginal fisher')

S('173', 'Situs of the tax', 'II',
  'A sale is recorded at the branch or outlet making it and the tax accrues there; '
  'with no branch, it is recorded at the principal office. For manufacturers and '
  'exporters, 30% of sales recorded at the principal office is taxable where that '
  'office is and 70% where the factory or plantation is. Where the plantation is '
  'elsewhere than the factory, that 70% splits 60% to the factory’s town and 40% '
  'to the plantation’s.',
  'situs where tax paid branch factory plantation 30 70 60 40')

S('174', 'Scope of city taxing powers', 'II',
  'A city may levy any tax, fee or charge a province or municipality may impose, and '
  'its rates may exceed the maximums allowed a province or municipality by up to '
  '50% — except the professional and amusement taxes.',
  'city tax rate higher 50 percent more than municipality')

S('175', 'Scope of barangay taxing powers', 'II',
  'A barangay may tax stores and retailers with fixed establishments whose gross '
  'receipts for the preceding year were ₱50,000 or less in cities and ₱30,000 or '
  'less in municipalities, at not more than 1% of those receipts. It may charge '
  'reasonable service fees for barangay-owned property such as palay, copra or '
  'tobacco dryers, and a fee for the barangay clearance that no city or municipality '
  'may issue a business permit without — acted on within seven working days, after '
  'which the permit may issue anyway. It may also levy fees on cockfighting and '
  'cockpits, places of recreation charging admission, billboards and outdoor '
  'advertisements, and commercial breeding of fighting cocks.',
  'barangay tax sari sari store clearance fee cockpit billboard 50000 30000 one percent')

S('178', 'Toll fees or charges', 'II',
  'A sanggunian may fix tolls for a road, pier, wharf, waterway, bridge, ferry or '
  'telecommunication system the unit funded and built. Officers and enlisted '
  'personnel of the Armed Forces and the police on mission, post office personnel '
  'delivering mail, persons with disabilities, citizens aged 65 or over, and '
  'emergency vehicles responding to emergencies are exempt. Where public safety '
  'requires, the sanggunian may stop collecting and open the facility free.',
  'toll bridge road fee exempt senior citizen 65 pwd ambulance')

S('180', 'Individuals liable to community tax', 'II',
  'Every inhabitant 18 or over who has been regularly employed for at least 30 '
  'consecutive working days in a year, is in business or a profession, owns real '
  'property assessed at ₱1,000 or more, or must file an income tax return, pays an '
  'annual community tax of ₱20 plus ₱1 for every ₱1,000 of income, capped at '
  '₱5,000.',
  'cedula community tax residence certificate how much 20 pesos cap 5000')

S('181', 'Juridical persons liable to community tax', 'II',
  'Every corporation doing business in the Philippines pays an annual community tax '
  'of ₱1,000 plus ₱5 for every ₱5,000 of real property it owns and ₱5 for every '
  '₱5,000 of gross receipts, the additional tax capped at ₱10,000.',
  'cedula corporation company community tax 1000 10000')

S('184', 'Time for payment of community tax', 'II',
  'The community tax accrues on 1 January and is payable by the last day of '
  'February. Unpaid, it carries interest of 24% a year from the due date. Anyone who '
  'turns 18 or loses an exemption on or after 1 July is not liable for that year.',
  'cedula deadline february interest 24 percent when pay')

S('187', 'Printing of community tax certificates and distribution', 'II',
  'The Bangsamoro Revenue Office prints community tax certificates and distributes '
  'them through city and municipal treasurers. What a city or municipal treasurer '
  'collects directly accrues entirely to that unit; what a barangay treasurer '
  'collects is split half to the city or municipality and half to the barangay.',
  'cedula proceeds share barangay 50 50 who keeps the money')

S('191', 'Surcharges and penalties on unpaid taxes', 'II',
  'A sanggunian may impose a surcharge of not more than 25% of the tax, fee or '
  'charge not paid on time, plus interest of not more than 2% a month on the unpaid '
  'amount including the surcharge, until paid — but the total interest may never '
  'exceed 36 months.',
  'penalty late tax surcharge 25 percent interest 2 percent 36 months')

S('211', 'Power to levy other taxes', 'II',
  'A unit may tax any base not otherwise enumerated in the Code or taxed under the '
  'national tax code, provided the levy is not unjust, excessive, oppressive, '
  'confiscatory or contrary to national policy, and only after a prior public '
  'hearing.',
  'new tax other taxes residual power public hearing')

S('212', 'Approval and effectivity of tax ordinances', 'II',
  'Public hearings must be held before a tax ordinance is enacted. Its '
  'constitutionality or legality may be appealed within 30 days of effectivity to the '
  'Secretary of Justice, who decides within 60 days; the appeal does not suspend the '
  'ordinance or the payment of the tax. The aggrieved party then has 30 days to go '
  'to court.',
  'challenge tax ordinance appeal secretary of justice 30 days public hearing')

S('213', 'Publication of tax ordinances', 'II',
  'Certified copies of every tax ordinance are published in full for three '
  'consecutive days in a newspaper of local circulation within 10 days of approval, '
  'or posted in at least two conspicuous public places where there is none, and '
  'posted on the unit’s website and the Bangsamoro Online Register of Ordinances. '
  'No tax ordinance takes effect until 15 days after publication.',
  'tax ordinance publish 15 days effect newspaper website')

S('216', 'Authority to adjust tax rates', 'II',
  'Local government units may adjust the tax rates the Code prescribes not oftener '
  'than once every five years, and in no case by more than 10%.',
  'raise tax rate increase five years 10 percent adjust')

S('218', 'Withdrawal of tax exemption privileges', 'II',
  'Tax exemptions enjoyed by any person, natural or juridical, including '
  'government-owned corporations, are withdrawn on the Code taking effect — except '
  'for local water districts, registered cooperatives, and non-stock non-profit '
  'hospitals and educational institutions.',
  'exemption withdrawn removed cooperative hospital school water district')

S('219', 'Periods of assessment and collection', 'II',
  'Local taxes must be assessed within five years of falling due and collected '
  'within five years of assessment, by administrative or judicial action. Where '
  'there is fraud or intent to evade, the period is 10 years from discovery. '
  'Prescription is suspended while the treasurer is legally prevented from acting, '
  'while a reinvestigation the taxpayer requested is pending, or while the taxpayer '
  'is out of the country.',
  'prescription five years ten years fraud assess collect deadline')

S('220', 'Protest of assessment', 'II',
  'A taxpayer has 60 days from a notice of assessment to file a written protest, or '
  'the assessment becomes final. The treasurer decides within 60 days; on denial or '
  'after the 60 days lapse the taxpayer has 30 days to appeal to court, otherwise '
  'the assessment is conclusive.',
  'protest assessment dispute tax bill 60 days appeal court')

S('223', 'Fundamental principles of real property taxation', 'II',
  'Real property is appraised at its current and fair market value, classified for '
  'assessment by its actual use, assessed on a uniform classification within each '
  'unit, and appraised equitably. The work may not be let to any private person.',
  'real property tax principles fair market value actual use')

S('225', 'Administration of the real property tax', 'II',
  'Provinces and cities are primarily responsible for the proper, efficient and '
  'effective administration of the real property tax.',
  'who collects real property tax province city amilyar')

S('227', 'Declaration of real property by the owner', 'II',
  'Owners and administrators must file a sworn statement of the true value of their '
  'property with the provincial or city assessor once every three years, between 1 '
  'January and 30 June.',
  'declare property tax declaration three years june 30')

S('243', 'Assessment levels', 'II',
  'Assessment levels applied to fair market value may not exceed, for land: '
  'residential 20%, agricultural 40%, commercial 50%, industrial 50%, mineral 50% '
  'and timberland 20%. Residential buildings are exempt up to ₱175,000 and then '
  'rise by value band from 10% to 60%; commercial and industrial buildings run from '
  '30% to 80%. Machinery: agricultural 40%, residential 50%, commercial 80%, '
  'industrial 80%. Special classes: cultural, scientific and hospital 15%, and local '
  'water districts and power GOCCs 10%.',
  'assessment level percentage residential agricultural commercial industrial '
  'machinery how is property tax computed')

S('244', 'General revision of assessments', 'II',
  'A province or city undertakes a general revision of real property assessments '
  'within two years of the Code taking effect and every three years after.',
  'reassessment general revision three years property values update')

S('250', 'Depreciation allowance for machinery', 'II',
  'Machinery is depreciated at not more than 5% of its original, replacement or '
  'reproduction cost for each year of use, but its remaining value is fixed at not '
  'less than 20% of that cost for as long as it is useful and in operation.',
  'machinery depreciation 5 percent 20 percent floor')

S('251', 'Local Board of Assessment Appeals', 'II',
  'An owner dissatisfied with an assessment has 60 days from the written notice to '
  'appeal to the Board of Assessment Appeals of the province or city, under oath and '
  'with the tax declarations and supporting documents. The Board is chaired by the '
  'Registrar of Deeds with the prosecutor and the engineer or architect as members, '
  'plus the Bangsamoro Revenue Office executive director, and decides within 120 '
  'days. Its decision may be appealed to the Central Board within 30 days.',
  'appeal property assessment too high lbaa 60 days 120 days cbaa')

S('256', 'Effect of appeal on payment', 'II',
  'An appeal against an assessment does not suspend the collection of the real '
  'property tax as assessed, without prejudice to adjustment once the appeal is '
  'decided.',
  'appeal still pay tax collection continues')

S('258', 'Rates of levy on real property', 'II',
  'A province may levy a basic real property tax of not more than 1% of assessed '
  'value; a city may levy not more than 2%.',
  'real property tax rate amilyar one percent two percent how much')

S('259', 'Exemptions from real property tax', 'II',
  'Exempt from real property tax: property of the Republic and its political '
  'subdivisions including BARMM, unless its beneficial use is granted to a taxable '
  'person; charitable institutions, churches, parsonages, mosques, non-profit '
  'cemeteries, and all land and buildings actually, directly and exclusively used '
  'for religious, charitable or educational purposes, including orphanages, Madaris '
  'and Tahfidz Al-Qur’an institutions; machinery of local water districts and '
  'power GOCCs; property of registered cooperatives; pollution control and '
  'environmental protection equipment; certified ancestral domains except parts used '
  'for large-scale agriculture, commercial or forest plantations, residential '
  'purposes or titled to private persons; and lands declared by the Chief Minister '
  'or the sanggunian to be physically or legally inaccessible to the owner by force '
  'majeure, civil disturbance, natural calamity or armed conflict, for up to one '
  'year unless extended.',
  'exempt property tax mosque madrasah church school ancestral domain '
  'armed conflict cooperative amilyar exemption')

S('260', 'Real property exempt during internal displacement', 'II',
  'Internally displaced persons are exempt from real property taxes and other local '
  'assessments on the properties they left behind while they are displaced.',
  'idp displaced evacuee property tax exempt left home war')

S('261', 'Additional levy for the Special Education Fund', 'II',
  'A province or city may levy an annual tax of 1% on the assessed value of real '
  'property in addition to the basic real property tax, the proceeds accruing '
  'exclusively to the Special Education Fund.',
  'sef special education fund one percent additional tax schools')

S('262', 'Additional ad valorem tax on idle lands', 'II',
  'A province or city may levy an annual tax on idle lands of not more than 5% of '
  'assessed value, in addition to the basic real property tax.',
  'idle land tax vacant lot 5 percent unused land')

S('263', 'Idle lands, coverage', 'II',
  'Idle lands are agricultural lands over one hectare suitable for cultivation of '
  'which half remains uncultivated, and non-agricultural lands in a city or '
  'municipality over 1,000 square meters of which half remains unused. Agricultural '
  'land with at least 50 trees to a hectare, and land actually used for grazing, are '
  'not idle. Regardless of area, the tax reaches residential lots in approved '
  'subdivisions transferred to individual owners.',
  'idle land definition hectare 1000 square meters subdivision lot vacant')

S('266', 'Special levy on lands benefited by public works', 'II',
  'A province, city or municipality may impose a special levy on lands especially '
  'benefited by public works it funded, not exceeding 60% of the actual cost '
  'including land acquisition, payable in not fewer than five and not more than 10 '
  'annual instalments. It does not apply to land exempt from basic real property tax '
  'or to land donated for the project.',
  'special levy betterment public works 60 percent instalments road')

S('276', 'Payment of real property taxes in instalments', 'II',
  'The basic real property tax and the Special Education Fund tax may be paid '
  'without interest in four equal instalments due on or before 31 March, 30 June, 30 '
  'September and 31 December. Payments are applied first to prior years’ '
  'delinquencies, interest and penalties.',
  'amilyar instalment quarterly deadline march june september december')

S('277', 'Tax discount for advance prompt payment', 'II',
  'Where the basic real property tax and the Special Education Fund tax are paid in '
  'advance on the prescribed schedule, the sanggunian may grant a discount of not '
  'more than 20% of the annual tax due.',
  'discount early payment advance 20 percent amilyar')

S('278', 'Payment under protest', 'II',
  'No protest against a real property tax is entertained unless the tax is paid '
  'first, with "paid under protest" annotated on the receipt. The written protest is '
  'filed within 30 days of payment and decided within 60 days; the amount is held in '
  'trust and refunded or credited if the protest succeeds.',
  'paid under protest property tax dispute refund 30 days 60 days')

S('281', 'Interest on unpaid real property tax', 'II',
  'Failure to pay on time carries interest of 2% a month on the unpaid amount until '
  'the tax is fully paid, with the total interest never exceeding 36 months. This is '
  'without prejudice to Shari’ah-compliant alternatives for unpaid taxes and late '
  'payments.',
  'amilyar penalty late interest 2 percent 36 months shariah')

S('287', 'Redemption of property sold for tax delinquency', 'II',
  'Within one year of the sale the owner may redeem the property by paying the '
  'delinquent tax, interest and expenses of sale plus not more than 2% a month on '
  'the purchase price. The owner keeps possession and the income of the property '
  'until the redemption period expires.',
  'redeem property auction tax delinquent one year buy back')

S('297', 'Distribution of real property tax proceeds', 'II',
  'In a province the basic real property tax is shared 35% to the province, 40% to '
  'the municipality where the property is, and 25% to its barangay. In a city, 70% '
  'accrues to the city and 30% goes to its barangays — half to the barangay where '
  'the property is and half shared equally by all of them. A barangay’s share is '
  'released directly to its treasurer quarterly within five days of the quarter '
  'ending, and may not be held back for any purpose.',
  'real property tax share barangay municipality province 35 40 25 70 30 amilyar where does it go')

S('298', 'Application of the Special Education Fund', 'II',
  'The Special Education Fund is released automatically to the local school boards, '
  'divided equally between the provincial and municipal school boards in provinces, '
  'and spent on operating and maintaining public schools, building and repairing '
  'school buildings, educational research, books, sports development, early '
  'childhood care and feeding for undernourished children.',
  'sef spend schools books feeding sports school board')

S('310', 'Share in the exploration and utilization of natural resources', 'II',
  'Revenues from the exploration, development and utilization of natural resources '
  'in BARMM, including mines and minerals, pertain fully to the Bangsamoro '
  'Government. For uranium and fossil fuels — petroleum, natural gas and coal — the '
  'revenues are shared equally with the national government. Seventy per cent of the '
  'Bangsamoro share is apportioned to its constituent local government units.',
  'natural resources mining oil gas coal share 70 percent uranium fossil fuel')

S('311', 'Equal benefit to all local government units', 'II',
  'Half the local government units’ share of natural resource revenues is '
  'allocated 20% to all provinces, 15% to all cities, 20% to all municipalities and '
  '15% to all barangays.',
  'natural resources share split all units 20 15 percent')

S('312', 'Additional share where the resources are located', 'II',
  'The other half goes where the resources are: in a province, 20% to the province, '
  '45% to the component city or municipality and 35% to the barangay; in a highly '
  'urbanised or independent component city, 65% to the city and 35% to the barangay. '
  'Where the resources span two or more units the share is computed 70% on '
  'population and 30% on land area.',
  'natural resources host share barangay 35 percent population land area')

S('313', 'Share in national taxes collected in the Bangsamoro', 'II',
  'Constituent local government units receive 40% of the Bangsamoro '
  'Government’s share of the national taxes, fees and charges collected in the '
  'Bangsamoro territorial jurisdiction. Half of that is divided among the units '
  'where the taxes were collected — 40% province, 30% municipality, 30% barangay, or '
  '60% city and 40% barangay — and half among all units, with provinces and cities '
  'sharing 10%, municipalities 40% and barangays 50%.',
  'share national taxes collected barmm 40 percent bol distribution')

S('314', 'Share from government agencies and GOCCs', 'II',
  'Units take a share of the proceeds of any national agency or GOCC using the '
  'national wealth, computed as whichever is higher: 1% of the gross sales or '
  'receipts of the preceding calendar year, or 40% of the mining taxes, royalties, '
  'forestry and fishery charges the entity would have paid if it were not exempt.',
  'gocc share national wealth one percent 40 percent royalties')

S('316', 'Development and livelihood projects', 'II',
  'A unit’s share of national wealth is appropriated for local development and '
  'livelihood projects — and at least 80% of proceeds from hydrothermal, geothermal '
  'and other energy sources must be applied solely to lowering the cost of '
  'electricity in the unit where the source is located.',
  'energy share electricity cheaper 80 percent geothermal hydro')

S('318', 'Credit financing: general policy', 'II',
  'A unit may create indebtedness and use credit facilities to finance local '
  'infrastructure and socio-economic projects in its approved development plan, and '
  'may take credit lines to stabilise local finances. Where a loan would create a '
  'liability for the Bangsamoro Government the unit needs MFBM clearance, and no '
  'direct Bangsamoro guarantee issues without an MFBM recommendation and the Chief '
  'Minister’s approval.',
  'loan borrow debt credit line bank financing clearance')

S('322', 'Bonds and other long-term securities', 'II',
  'Provinces, cities and municipalities may issue bonds, debentures, securities and '
  'notes to finance self-liquidating, income-producing development or livelihood '
  'projects in their approved plan, subject to the rules of the Bangko Sentral and '
  'the Securities and Exchange Commission and an ordinance approved by a majority of '
  'all sanggunian members.',
  'bonds securities issue debt finance project')

S('326', 'Infrastructure projects by the private sector', 'II',
  'A unit may contract with a pre-qualified contractor to finance, build, operate '
  'and maintain infrastructure under a build-operate-and-transfer agreement. Tolls, '
  'fees and rentals must be approved by the unit and may be collected for a fixed '
  'period that in no case exceeds 50 years, with the contractor maintaining the '
  'facility throughout.',
  'bot build operate transfer private sector infrastructure 50 years ppp')

S('327', 'Remedies and sanctions on indebtedness', 'II',
  'Units must appropriate enough in their annual budgets to pay their loans and '
  'retire their bonds; failing to do so renders the annual budget inoperative.',
  'loan repayment budget inoperative debt service')

# ------------------------------------ Book II, Title VI: fiscal admin -------
S('329', 'Fundamental principles of local fiscal administration', 'II',
  'No money may leave the local treasury except under an appropriations ordinance '
  'or a law; funds are spent solely for public purposes; revenue comes only from '
  'sources authorised by law or ordinance; every officer handling local funds is '
  'bonded and accountable; budgets operationalise the approved development plan; '
  'units endeavour to balance the budget each year; and they promote honest, '
  'transparent management of public funds under the full disclosure policy.',
  'fiscal principles public money rules balanced budget transparency')

S('333', 'Special funds', 'II',
  'Every provincial, city and municipal treasury maintains a Special Education Fund '
  'from its share of the additional 1% real property tax, and Trust Funds of private '
  'and public monies received as trustee or as a guaranty — a trust fund may be used '
  'only for the purpose it was created for.',
  'special funds sef trust fund general fund')

S('340', 'Local finance committee', 'II',
  'Every province, city and municipality has a local finance committee of the '
  'planning and development officer, the budget officer, the accountant and the '
  'treasurer. It projects collectible income, recommends revenue measures and '
  'spending ceilings, helps the sanggunian review the budgets of component units, '
  'and conducts a semi-annual review of cost against accomplishment that must be '
  'posted in public places.',
  'finance committee budget ceiling projection review')

S('341', 'Submission of budget proposals', 'II',
  'Each department or office head submits a budget proposal to the chief executive '
  'on or before 15 July each year, categorised under economic, social or general '
  'services, with organizational charts, staffing patterns, expected results and '
  'accomplishment reports for the last two years.',
  'budget proposal deadline july 15 department office')

S('343', 'Legislative authorization of the budget', 'II',
  'On or before the end of the current fiscal year the sanggunian enacts the annual '
  'budget by ordinance, on the estimates the chief executive submitted and the '
  'Annual Investment Plan the unit prepared.',
  'budget enact deadline end of year ordinance annual investment plan')

S('345', 'Changes in the annual budget', 'II',
  'Once the executive budget is with the sanggunian, no supplemental budget may be '
  'enacted unless supported by funds actually available as certified by the '
  'treasurer or by new revenue sources. In a public calamity a supplemental budget '
  'may realign funds for goods or services that are exceptionally urgent or '
  'indispensable to prevent imminent danger to life or property.',
  'supplemental budget realign calamity change budget certified funds')

S('347', 'Failure to enact the annual appropriations', 'II',
  'If the sanggunian has not passed the budget by the start of the fiscal year it '
  'keeps sitting, without additional remuneration and on no other business, until it '
  'does. After 90 days the preceding year’s ordinance is deemed reenacted — but '
  'only for salaries and wages of existing positions, statutory and contractual '
  'obligations and essential operating expenses, and the treasurer must exclude '
  'non-recurring income from the estimates.',
  'no budget reenacted 90 days failure to pass delayed budget')

S('348', 'Budgetary requirements', 'II',
  'A local budget must not appropriate more than the estimated income and must fully '
  'provide for statutory and contractual obligations, with debt servicing capped at '
  '20% of regular income. Aid to each component barangay is not less than ₱1,000. '
  'Five per cent of estimated revenue from regular sources is set aside as a lump '
  'sum for calamities. Not less than 20% of the annual National Tax Allotment goes '
  'to development projects. At least 5% of the annual budget supports gender and '
  'development. At least 1% each goes to programs for senior citizens, for persons '
  'with disabilities, for the local council for the protection of children, and for '
  'the maintenance of local roads. Sufficient funding must also cover nutrition, '
  'drug rehabilitation, culture and heritage, agriculture and fisheries, climate '
  'change adaptation, health emergencies and benefits for solo parents.',
  'budget requirements 20 percent development fund 5 percent calamity gad gender '
  '1 percent senior citizen pwd children local roads mandatory allocation '
  'where does the budget go')

S('349', 'General limitations on the use of funds', 'II',
  'Total appropriations for personal services may not exceed 45% of the total annual '
  'income from regular sources of the preceding year for first to third class '
  'provinces, cities and municipalities, or 55% for fourth class and lower. No local '
  'fund may raise the pay of national government employees. The chief '
  'executive’s discretionary funds may not exceed 2% of the actual basic real '
  'property tax receipts of the preceding year, and must be disbursed only for '
  'public purposes with vouchers.',
  'personal services cap 45 percent 55 percent salary limit discretionary fund 2 percent')

S('353', 'Barangay funds', 'II',
  'All barangay receipts accrue to its general fund, held as a trust fund with the '
  'city or municipal treasurer or deposited in a bank at the barangay’s option. '
  'Ten per cent of the barangay general fund is set aside and appropriated for the '
  'sangguniang kabataan.',
  'barangay funds sk 10 percent youth budget where money goes')

S('355', 'Preparation of the barangay budget', 'II',
  'The punong barangay prepares the annual barangay budget on the treasurer’s '
  'statement and submits it to the sangguniang barangay. Total appropriations for '
  'personal services may not exceed 55% of the total annual income actually realized '
  'from local sources the preceding year.',
  'barangay budget personal services 55 percent honorarium limit')

S('357', 'Review of the barangay budget', 'II',
  'Within 10 days of approval the barangay furnishes its appropriations ordinance to '
  'the sangguniang panlungsod or bayan through the budget officer. If the sanggunian '
  'does not act within 60 days the budget stands; if it finds appropriations beyond '
  'certified collectible income or contrary to the Code it declares them inoperative '
  'and the barangay operates on the preceding year’s budget until the objections '
  'are met.',
  'barangay budget review 60 days inoperative approve')

S('358', 'Barangay financial procedures', 'II',
  'The barangay treasurer collects and issues official receipts and deposits '
  'collections within five days. The sangguniang barangay may authorise direct '
  'purchases of not more than ₱1,000 at any one time for ordinary and essential '
  'needs, and the treasurer’s petty cash may not exceed 20% of the funds to the '
  'barangay’s credit. The financial records are kept by the city or municipal '
  'accountant and audited annually by the Commission on Audit.',
  'barangay treasurer purchase 1000 petty cash 20 percent deposit five days audit')

S('359', 'Use of appropriated funds and savings', 'II',
  'Funds are available only for the purpose appropriated, and no ordinance may '
  'transfer appropriations from one item to another. A chief executive or presiding '
  'officer may be authorised by ordinance to augment an item in their own office '
  'from savings in other items within the same expense class.',
  'savings augmentation realign transfer funds same expense class')

S('360', 'Restriction upon limit of disbursements', 'II',
  'Total disbursements from any local fund may not exceed 50% of the uncollected '
  'estimated revenue accruing to it plus actual collections, and no cash overdraft '
  'may be incurred at the end of the fiscal year. In a typhoon, earthquake or other '
  'calamity the sanggunian may authorise the treasurer to exceed the limit for '
  'purposes and amounts already in the approved budget.',
  'disbursement limit 50 percent overdraft calamity spending cap')

S('361', 'Prohibitions against advance payments', 'II',
  'No money may be paid on a contract under which no services have been rendered or '
  'goods delivered.',
  'advance payment downpayment prohibited no service delivered')

S('366', 'Prohibition against expenses for reception and entertainment', 'II',
  'No money may be appropriated, used or paid for entertainment or reception, except '
  'to the extent of representation allowances authorised by law, for receiving '
  'visiting dignitaries of foreign governments or missions, or when expressly '
  'authorised by the President.',
  'entertainment expense party reception banquet prohibited representation allowance')

S('367', 'Certification on and approval of vouchers', 'II',
  'No money may be disbursed unless the budget officer certifies an appropriation '
  'exists, the accountant has obligated it, and the treasurer certifies funds are '
  'available. The chief executive must approve the voucher whenever local funds are '
  'disbursed, except for regularly recurring administrative expenses such as regular '
  'payrolls, utilities and remittances to creditor agencies.',
  'voucher approval disbursement certify funds available mayor signature')

S('375', 'Posting of the summary of income and expenditures', 'II',
  'Within 30 days of the end of each fiscal year, local treasurers, accountants and '
  'budget officers must post in at least three publicly accessible and conspicuous '
  'places in the unit a summary of all revenues collected and funds received, '
  'including the appropriations and disbursements of the preceding year.',
  'post income expenditure transparency 30 days three places full disclosure')

S('379', 'General rule in procurement or disposal', 'II',
  'Procurement of goods by local government units is through competitive public '
  'bidding, and property that has become unserviceable or is no longer needed is '
  'sold at public auction. No unit may enter an executive agreement contrary to the '
  'Government Procurement Reform Act.',
  'procurement bidding buy goods auction dispose ra 9184')

S('387', 'Bids and Awards Committee', 'II',
  'Every province, city, municipality and barangay has a Bids and Awards Committee '
  'under the Government Procurement Reform Act, its members drawn from plantilla '
  'personnel. The local chief executive and other elective officials, the official '
  'who approves procurement contracts, and the chief accountant and staff may not '
  'sit on it — unless accounting is the end-user unit.',
  'bac bids and awards committee members mayor cannot sit procurement')

S('395', 'Property disposal and environmental responsibility', 'II',
  'Unserviceable property is inspected and appraised by the auditor; if valueless it '
  'is destroyed in the inspecting officer’s presence, and if valuable it is sold '
  'at public auction with notice posted in at least three public places — published '
  'twice where the acquisition cost exceeded ₱100,000. Disposal must be consistent '
  'with efficiency and environmental responsibility.',
  'dispose old equipment auction junk vehicles 100000 notice')

S('398', 'Tax exemption privileges of local government units', 'II',
  'Local government units are exempt from duties and taxes on importing heavy '
  'equipment or machinery for building and maintaining roads, bridges and other '
  'infrastructure, as well as garbage trucks, fire trucks and similar equipment.',
  'import equipment tax exempt fire truck garbage truck heavy equipment')

# ----------------------------------------- Book III, Title I: barangay ------
S('400', 'Role of the barangay', 'III',
  'The barangay is the basic political unit. It is the primary planning and '
  'implementing unit of government policies, plans and programs in the community, '
  'a forum where the collective views of the people may be expressed, and the place '
  'where disputes may be amicably settled.',
  'barangay role what is a barangay purpose basic unit')

S('401', 'Manner of creating a barangay', 'III',
  'A barangay may be created, divided, merged or abolished by a law of Parliament or '
  'by an ordinance of the sangguniang panlalawigan or panlungsod, subject to a '
  'majority of the votes cast in a plebiscite conducted by the Bangsamoro Electoral '
  'Office in the units directly affected. Where the province creates it, the '
  'sangguniang bayan concerned must first recommend it.',
  'create barangay new barangay who can create plebiscite split')

S('402', 'Manner of abolishing a barangay', 'III',
  'A barangay may be abolished where its population has been irreversibly reduced '
  'over the three immediately preceding consecutive years to less than the '
  'requirement for its creation, as certified by the Philippine Statistics '
  'Authority. The abolishing law or ordinance names the unit it merges with.',
  'abolish barangay merge population dropped three years')

S('403', 'Revalidation of barangays', 'III',
  'The MILG revalidates the compliance of all barangays in BARMM, starting with '
  'those created under the ARMM code that failed the standards of the national Local '
  'Government Code, and reports to the Office of the Chief Minister. Barangays found '
  'to meet the criteria are entitled to the National Tax Allotment; those that fail '
  'are merged with another barangay by law or ordinance.',
  'revalidate barangay mmaa 25 armm nta merge fail criteria milg')

S('405', 'Requisites for creating a barangay', 'III',
  'A barangay may be created out of a contiguous territory with at least 2,000 '
  'inhabitants certified by the Philippine Statistics Authority, without dropping '
  'the original barangay below that figure. Its territory must be identified by '
  'metes and bounds or permanent natural boundaries, and need not be contiguous if '
  'it comprises two or more islands. Creation also requires the donation of a lot of '
  'not less than 1,500 square meters for a permanent government center — a barangay '
  'hall, health center, day care center or multi-purpose hall.',
  'create barangay requirements 2000 population 1500 square meters lot donation')

S('406', 'Creation of tribal barangays', 'III',
  'Tribal barangays may be created for communities of non-Moro indigenous peoples '
  'who are a minority in their municipality or city but native to it, despite the '
  '2,000-inhabitant requirement, provided the area is contiguous and the indigenous '
  'peoples are the predominant population. They are funded by the Bangsamoro '
  'Government or the province until they qualify for the National Tax Allotment, and '
  'are governed like any other barangay.',
  'tribal barangay indigenous non moro nmip create minority native')

S('408', 'Powers, functions, services and facilities of the barangay', 'III',
  'The barangay delivers services across fifteen fields: agriculture, including '
  'farm-to-market roads and a register of farmers and fishers; health, running the '
  'barangay health station and engaging barangay health workers; social services, '
  'including the Violence Against Women desk, the Barangay Council for the '
  'Protection of Children and child development centers; environment, including '
  'waste segregation and a materials recovery facility; infrastructure such as '
  'barangay roads, footbridges, water supply, plazas and markets; disaster risk '
  'reduction, keeping a barangay risk map and early-warning system; public order '
  'through tanods who are civilians and may not carry firearms, and the katarungang '
  'pambarangay; education, running a library or reading center and the palarong '
  'barangay; trade, issuing barangay clearance for business permits; tourism; labour, '
  'keeping the kasambahay registry and an overseas workers help desk; transport, '
  'franchising pedal-powered traysikad; cooperatives; human rights, through a '
  'Barangay Human Rights Action Center; and culture and the arts.',
  'barangay services what does a barangay do functions health tanod waste '
  'clearance day care library vaw desk')

S('410', 'Barangay registry and community-based monitoring system', 'III',
  'Every barangay keeps a registry of all residents with the information their needs '
  'require — food security, health, livelihood, shelter, clothing — under data '
  'privacy law, with an ordinance providing how new residents are entered and '
  'departing ones removed. It must also set up a monitoring team drawn from civil '
  'society, the religious sector and the academe to monitor and report on the conduct '
  'of officials and the status of government projects in its territory.',
  'barangay registry residents list monitoring team watchdog report projects')

S('411', 'Establishment of a citizens’ charter', 'III',
  'Each barangay must publish a citizens’ charter setting out its frontline '
  'services, the detailed steps for each, the time allotted, and the person '
  'accountable for every task.',
  'citizens charter frontline services how long process accountable')

S('412', 'Transparency in financial transactions', 'III',
  'Every semester, and at least two weeks before the barangay assembly, each '
  'barangay must post the flow of its financial transactions outside the barangay '
  'hall and in at least three conspicuous public places, with a soft copy posted on '
  'the MILG website and the barangay’s own site where it has one.',
  'barangay finances transparency post money spending two weeks assembly')

S('413', 'Officials and offices of the barangay', 'III',
  'Each barangay has a punong barangay, seven sangguniang barangay members, the '
  'sangguniang kabataan chairperson, a barangay secretary and a barangay treasurer. '
  'There is also a lupon tagapamayapa, child development center teachers, barangay '
  'health workers, purok leaders and local farm technicians.',
  'how many kagawad councilors barangay officials captain chairman seven members '
  'secretary treasurer sk who are the officials')

S('414', 'Other barangay personnel', 'III',
  'The sangguniang barangay may form volunteer community brigades and engage purok '
  'leaders and local farm technicians. A purok is a division within a barangay of at '
  'least 20 households, serving as a unit for delivering services. Barangay tanods '
  'number one for every 200 inhabitants and in no case more than 30.',
  'purok how many households tanod how many 200 inhabitants 30 maximum brigade')

S('416', 'Persons in authority', 'III',
  'For the Revised Penal Code the punong barangay, the sangguniang barangay members '
  'and the members of the lupong tagapamayapa are persons in authority within their '
  'jurisdictions. Other barangay officials charged with keeping public order, and any '
  'barangay member who comes to the aid of a person in authority, are agents of '
  'persons in authority.',
  'person in authority tanod kagawad captain legal status penal code assault')

S('417', 'Powers, duties and functions of the punong barangay', 'III',
  'The punong barangay enforces all laws and ordinances applicable in the barangay, '
  'signs contracts on the sanggunian’s authorisation, presides over its sessions '
  'and the barangay assembly and votes only to break a tie, appoints or replaces the '
  'treasurer, the secretary and other appointive officials with the concurrence of a '
  'majority of all sangguniang barangay members, prepares the annual and supplemental '
  'budgets with the development council, approves vouchers, administers the '
  'katarungang pambarangay, and supervises the sangguniang kabataan.',
  'barangay captain powers duties chairman what does he do appoint contract')

S('418', 'Composition of the sangguniang barangay', 'III',
  'The sangguniang barangay is composed of the punong barangay as presiding officer, '
  'the seven regular sangguniang barangay members elected at large, the sangguniang '
  'kabataan chairperson, and a mandatory indigenous peoples and/or settler '
  'representative where applicable — guaranteed where either group is at least 5% of '
  'the barangay’s population but holds not more than 50% of its elective offices, '
  'or where a recognized native title lies within the barangay.',
  'sangguniang barangay members composition seven kagawad council ip settler '
  'representative five percent')

S('419', 'Powers, duties and functions of the sangguniang barangay', 'III',
  'The sangguniang barangay enacts ordinances, tax and revenue ordinances and annual '
  'and supplemental budgets; provides compensation, allowances and per diems for '
  'barangay officials, though no increase takes effect until the term of all the '
  'members who approved it has expired; holds fund-raising for barangay projects '
  'without any permit, tax-exempt, but never within 60 days before or after an '
  'election; authorises the treasurer to make direct purchases of not more than '
  '₱5,000 at any one time; and prescribes fines of not more than ₱3,000 for '
  'violating a barangay ordinance.',
  'barangay council powers fine 3000 fund raising purchase 5000 ordinance '
  'how much can a barangay fine')

S('421', 'Barangay secretary', 'III',
  'The punong barangay appoints the barangay secretary with the concurrence of a '
  'majority of all sangguniang barangay members, and the appointment needs no Civil '
  'Service attestation. The secretary must be of legal age, a qualified voter and an '
  'actual resident, and may not be a sanggunian member, a government employee, or a '
  'relative of the punong barangay within the fourth civil degree. The secretary '
  'keeps the records and minutes, prepares the assembly list, assists in elections '
  'and in registering births, deaths and marriages, and keeps the barangay registry.',
  'barangay secretary appointment qualifications relative fourth degree duties')

S('422', 'Barangay treasurer', 'III',
  'The barangay treasurer is appointed the same way and under the same '
  'disqualifications as the secretary, and must be bonded in an amount the '
  'sangguniang barangay sets, not exceeding ₱10,000, with the premium paid by the '
  'barangay. The treasurer keeps custody of barangay funds and property, collects '
  'and issues official receipts, disburses funds, certifies availability of funds, '
  'and renders a written accounting at the end of each calendar year that must be '
  'made available to the barangay assembly.',
  'barangay treasurer bond 10000 duties appointment collect funds accounting')

S('424', 'Benefits of barangay officials', 'III',
  'The punong barangay receives a monthly honorarium of not less than ₱5,000 and '
  'not more than the first step of salary grade 14 for the income class of the city '
  'or municipality, paid from barangay funds and subsidised by the Bangsamoro '
  'Government through the MILG where the barangay cannot afford it. Sangguniang '
  'barangay members, the secretary, the treasurer, the sangguniang kabataan '
  'chairperson and the IP or settler representative receive not less than ₱3,000 '
  'and not more than the first step of salary grade 10. Barangay tanods and purok '
  'leaders receive not less than ₱1,000 a month. Each lupon member receives an '
  'honorarium for every pangkat proceeding attended, the aggregate not exceeding '
  '₱2,000 a month. Child development center teachers, barangay health workers, '
  'barangay nutrition scholars and local farm technicians receive not less than '
  '₱1,000 a month. Officials are also entitled to insurance coverage with premiums '
  'not exceeding 1% of barangay appropriations, free medical care under the Universal '
  'Health Care Act, exemption from tuition for dependent children in state colleges, '
  'civil service eligibility based on years of barangay service, and preference in '
  'government appointments after their tenure.',
  'barangay captain salary honorarium how much paid kagawad pay tanod pay 5000 '
  '3000 1000 insurance scholarship free tuition benefits')

S('425', 'Barangay assembly', 'III',
  'The barangay assembly is composed of all actual residents of at least six months '
  'who are 15 years of age or over, are Filipino citizens and are registered in the '
  'list of assembly members. It meets at least twice a year to hear the semestral '
  'report of the sangguniang barangay on its activities and finances, called by the '
  'punong barangay, by at least four sangguniang barangay members, or on the written '
  'petition of at least 5% of assembly members, with one week’s written notice.',
  'barangay assembly who can attend 15 years old twice a year meeting residents')

S('426', 'Powers of the barangay assembly', 'III',
  'The barangay assembly may recommend measures to the sangguniang barangay, decide '
  'on adopting initiative as the process by which registered voters directly propose, '
  'enact or amend an ordinance, and hear and pass upon the semestral report of the '
  'sangguniang barangay on its activities and finances.',
  'barangay assembly powers what can it do initiative report')

# ----------------------------- Book III, Chapter V: katarungang pambarangay --
S('427', 'Lupong tagapamayapa \u2014 the katarungang pambarangay in every barangay', 'III',
  'Each barangay has a lupong tagapamayapa of the punong barangay as chairperson '
  'and 10 to 20 members of the community, constituted every three years, without '
  'prejudice to the participation of religious and traditional leaders, settlers, '
  'non-Moro indigenous peoples, women, persons with disability, youth and solo '
  'parents. Where most inhabitants are members of indigenous cultural communities, '
  'traditional systems of settling disputes, conflict resolution institutions, '
  'peacebuilding processes and other customary laws are recognized, and the '
  'proceedings under them take the place of the katarungang pambarangay process — '
  'with the settlement or award confirmed by the lupon for execution.',
  'lupon tagapamayapa members 10 20 customary law traditional settlement '
  'indigenous how many members')

S('430', 'Functions of the lupon', 'III',
  'The lupon supervises the conciliation panels and meets at least once a month to '
  'exchange ideas with its members and the public on settling disputes amicably and '
  'to let the pangkat share observations on resolving disputes quickly.',
  'lupon duties meeting monthly conciliation')

S('432', 'Pangkat ng tagapagkasundo', 'III',
  'For each dispute brought before the lupon a conciliation panel of three members '
  'is constituted, chosen by the parties from the list of lupon members. If the '
  'parties cannot agree the lupon chairperson draws lots. The three elect a '
  'chairperson and a secretary among themselves.',
  'pangkat three members conciliation panel chosen lots')

S('434', 'Character of office of lupon and pangkat members', 'III',
  'Lupon members performing their duties are persons in authority under the Revised '
  'Penal Code, and whether in public or private employment are deemed to be on '
  'official time and may suffer no reduction in pay or allowance from that '
  'employment.',
  'lupon member official time salary employer leave person in authority')

S('436', 'Subject matter for amicable settlement; exceptions', 'III',
  'The lupon may bring together parties residing in the same city or municipality to '
  'settle all disputes except: where the government or any of its subdivisions is a '
  'party; where a public officer’s official functions are in issue; offences '
  'punishable by more than one year’s imprisonment or a fine over ₱5,000; '
  'offences with no private offended party; disputes over real property in different '
  'cities or municipalities; parties actually residing in different cities or '
  'municipalities, unless the barangays adjoin and the parties agree; complaints by '
  'or against corporations, partnerships or juridical entities; agrarian reform '
  'disputes; labour disputes; actions to annul a judgment on compromise; violence '
  'against women and their children and related matters including support, custody '
  'and protection orders; civil status, marriage and legal separation; future '
  'support; matters of court jurisdiction; and future legitime.',
  'barangay settlement exceptions cannot settle court vawc labour agrarian '
  'corporation which cases barangay cannot handle')

S('437', 'Prohibition on collection of money', 'III',
  'No money or its equivalent may be collected from a complainant or respondent for '
  'the services of the lupon or barangay officials, except a minimal filing fee set '
  'by a barangay ordinance. A barangay official or lupon member who collects anything '
  'else suffers reprimand, suspension or removal from office after due process.',
  'barangay case fee free no payment filing fee lupon collect money')

S('438', 'Venue of amicable settlement', 'III',
  'Disputes between residents of the same barangay go before its lupon; between '
  'residents of different barangays in the same city or municipality, before the '
  'barangay where the respondent resides, at the complainant’s election; disputes '
  'over real property, before the barangay where the property or its larger portion '
  'is; and disputes arising at a workplace or school, before the barangay where it '
  'is located. Objections to venue must be raised during mediation or are waived.',
  'where to file barangay complaint venue which barangay respondent property')

S('439', 'Procedure for amicable settlement', 'III',
  'On payment of the filing fee anyone with a cause of action may complain orally or '
  'in writing to the lupon chairperson, who summons the respondent the next working '
  'day for mediation. If mediation fails within 15 days of the first meeting the '
  'chairperson sets the constitution of the pangkat, which convenes within three '
  'days and must settle within 15 days, extendible once by another 15 in clearly '
  'meritorious cases. Filing the complaint interrupts the prescriptive period for the '
  'offence or cause of action, for no more than 60 days.',
  'barangay complaint process how long 15 days summon mediation pangkat '
  'prescription 60 days file case')

S('440', 'Form of settlement', 'III',
  'All amicable settlements must be in writing, in a language or dialect known to '
  'the parties, signed by them and attested by the lupon or pangkat chairperson. '
  'Where the parties do not share a language the settlement is written in one they '
  'both know.',
  'settlement written language dialect signed attested')

S('441', 'Conciliation as a pre-condition to filing in court', 'III',
  'No complaint on any matter within the lupon’s authority may be filed directly '
  'in court or any government office unless there has been a confrontation before '
  'the lupon chairperson or the pangkat and no settlement was reached, certified as '
  'such, or the settlement was repudiated. Parties may go straight to court where '
  'the accused is detained, where habeas corpus is called for, where the action is '
  'coupled with provisional remedies such as preliminary injunction, attachment, '
  'delivery of personal property or support pendente lite, or where the statute of '
  'limitations would otherwise bar it. Among indigenous cultural communities the '
  'customs and traditions of the community apply.',
  'barangay certification to file action ctfa court requirement skip barangay '
  'detained injunction first before court')

S('442', 'Arbitration', 'III',
  'The parties may agree in writing at any stage to abide by the arbitration award '
  'of the lupon chairperson or the pangkat. The agreement may be repudiated within '
  'five days, and the award is made after that period and within 10 days after, in '
  'writing and in a language known to the parties.',
  'arbitration award barangay five days repudiate binding')

S('443', 'Proceedings open to the public', 'III',
  'All settlement proceedings are public and informal, though the lupon or pangkat '
  'chairperson may exclude the public on their own motion or at a party’s request '
  'in the interest of privacy, decency or public morals.',
  'barangay hearing public private closed door')

S('444', 'Appearance of parties in person', 'III',
  'In all katarungang pambarangay proceedings the parties must appear in person '
  'without the assistance of counsel or a representative. Minors and incompetents '
  'may be assisted by their next of kin, who must not be lawyers.',
  'lawyer barangay hearing appear in person no counsel represent minor')

S('445', 'Effect of amicable settlement and arbitration award', 'III',
  'An amicable settlement or arbitration award has the force and effect of a final '
  'court judgment on the expiration of 10 days from its date, unless it has been '
  'repudiated or a petition to nullify the award has been filed in the city or '
  'municipal court.',
  'settlement binding final judgment 10 days enforce')

S('446', 'Execution of settlement', 'III',
  'The lupon may enforce the settlement or award by execution within six months of '
  'the date of settlement. After that it may be enforced only by action in the '
  'appropriate city or municipal court.',
  'enforce settlement six months execution court not followed')

S('447', 'Repudiation of settlement', 'III',
  'A party may repudiate a settlement within 10 days of its date by filing a sworn '
  'statement with the lupon chairperson, where consent was vitiated by fraud, '
  'violence or intimidation. The repudiation is sufficient basis for issuing the '
  'certification to file a complaint in court.',
  'repudiate settlement 10 days fraud intimidation cancel agreement')

S('449', 'Power to administer oaths', 'III',
  'The punong barangay as chairperson of the lupong tagapamayapa and the members of '
  'the pangkat are authorised to administer oaths in any matter relating to the '
  'proceedings of the katarungang pambarangay.',
  'oath administer barangay captain notarise sworn')

# --------------------------- Book III, Chapter VI: sangguniang kabataan -----
S('452', 'Creation and election of the sangguniang kabataan', 'III',
  'Every barangay has a sangguniang kabataan of a chairperson and seven members '
  'elected by the registered voters of the katipunan ng kabataan. The chairperson, '
  'with the concurrence of a majority of the members, appoints a secretary and a '
  'treasurer from among the katipunan.',
  'sk how many members seven chairperson chairman secretary treasurer youth council')

S('453', 'Katipunan ng kabataan', 'III',
  'The katipunan ng kabataan is composed of all Filipino citizens actually residing '
  'in the barangay for at least six months who are 15 but not more than 30 years of '
  'age and registered with the Bangsamoro Electoral Office or on the official '
  'barangay list.',
  'katipunan ng kabataan who can vote sk age 15 30 youth voter')

S('456', 'Sangguniang kabataan funds', 'III',
  'The sangguniang kabataan is funded by the 10% of the barangay general fund set '
  'aside for it, plus funds from any other source. It has financial independence in '
  'its operations and disbursements, with its funds deposited in a government bank '
  'in the SK’s name and the chairperson and treasurer as official signatories. Its '
  'budget follows the Comprehensive Barangay Youth Development Plan and is reviewed '
  'by the sangguniang bayan or panlungsod within 45 days, after which it is deemed '
  'approved. Not more than 15% of the SK fund may go to training.',
  'sk funds 10 percent budget bank account signatories review 45 days training 15 percent')

S('457', 'Powers and functions of the sangguniang kabataan', 'III',
  'Within three months of assuming office the sangguniang kabataan formulates a '
  'three-year Comprehensive Barangay Youth Development Plan with the concurrence of '
  'the katipunan, which is the basis of its annual investment program and budget. '
  'It promulgates resolutions, runs youth programs, holds tax-exempt fund-raising '
  'in line with the plan, submits annual and end-of-term accomplishment and financial '
  'reports, adopts full public disclosure of its transactions, and delivers a '
  'mandatory State of the Barangay Youth Address during linggo ng kabataan.',
  'sk powers cbydp youth development plan budget report sobya what does sk do')

S('459', 'Qualifications of sangguniang kabataan officials', 'III',
  'An SK chairperson or member must be a Filipino citizen, a qualified voter of the '
  'katipunan ng kabataan, a resident of the barangay for at least one year before '
  'the election, at least 18 but not more than 24 years of age on election day, able '
  'to read and write Filipino, English, the local language or Arabic, not related '
  'within the second civil degree of consanguinity or affinity to any incumbent '
  'elected national, regional, provincial, city, municipal or barangay official in '
  'the locality, and not convicted by final judgment of a crime involving moral '
  'turpitude.',
  'sk qualifications age 18 24 run for sk requirements relative arabic chairman chairperson')

S('460', 'Term of office of sangguniang kabataan officials', 'III',
  'SK chairpersons and members hold office for three years. An official who passes '
  'the age of 24 during the term may serve out the remainder of the term they were '
  'elected to.',
  'sk term three years turn 24 age out serve remainder')

S('461', 'The sangguniang kabataan chairperson', 'III',
  'The SK chairperson automatically serves as an ex officio member of the '
  'sangguniang barangay on assuming office, exercising the same powers, duties and '
  'privileges as a regular sangguniang barangay member, and chairs its committee on '
  'youth and sports development.',
  'sk chairman kagawad ex officio sangguniang barangay member committee youth')

S('465', 'Privileges of sangguniang kabataan officials', 'III',
  'SK officials in good standing are exempt from tuition and matriculation fees at '
  'state colleges and universities, exempt from the NSTP civic welfare training '
  'service, excused from classes while attending SK meetings and sangguniang '
  'barangay sessions, given PhilHealth coverage by the national government, and paid '
  'a monthly honorarium from SK funds that may not exceed what their chairperson '
  'receives — with honoraria and other personal services capped at 25% of the SK '
  'fund.',
  'sk benefits free tuition nstp exempt philhealth honorarium 25 percent')

S('467', 'Suspension and removal of sangguniang kabataan officials', 'III',
  'An elected SK official may be suspended for up to six months or removed by a '
  'majority vote of all members of the sangguniang bayan or panlungsod with '
  'jurisdiction, on grounds including absence from two consecutive SK meetings or '
  'four accumulated absences in 12 months, failing to convene the katipunan assembly '
  'twice in a row, failing to convene SK meetings for three consecutive months, '
  'failing to formulate the youth development plan or approve the budget on time, '
  'failing to implement the programs in it, four consecutive absences from '
  'sangguniang barangay sessions, conviction for moral turpitude, graft, or failure '
  'in the discharge of duty.',
  'sk removal suspension absences fail to convene remove sk chairman')

S('471', 'Pederasyon ng mga sangguniang kabataan', 'III',
  'SK chairpersons form a pambayang pederasyon in municipalities and a panlungsod na '
  'pederasyon in cities; their convenors form the panlalawigang pederasyon in '
  'provinces, and those convenors the panrehiyong pederasyon for BARMM. Each level '
  'elects a president, vice president, treasurer and secretary, with elections held '
  'within 15 days of the SK elections at municipal and city level and 30 days at '
  'provincial level.',
  'sk federation pederasyon president municipal provincial regional election 15 days')

S('473', 'Membership of the pederasyon president in the sanggunian', 'III',
  'The elected president of the SK pederasyon at each level is an ex officio member '
  'of the sangguniang bayan, panlungsod or panlalawigan, chairs its committee on '
  'youth, and sits as a regular member of the committees on education, environmental '
  'protection, employment and livelihood, health and anti-drug abuse, sports, and '
  'gender and development. The president is also an ex officio member of the local '
  'school board, the council for the protection of children, the development '
  'council, the health board, the tourism council and the peace and order council.',
  'sk federation president councilor ex officio committees school board seats')

S('474', 'Observance of the linggo ng kabataan', 'III',
  'Every barangay, municipality, city, province and the Bangsamoro Government holds '
  'an annual linggo ng kabataan in the week that 12 August falls in, to coincide with '
  'International Youth Day. It includes electing youth aged 14 to 18 as counterparts '
  'of all local elective and appointive officials, who hold office as young officials '
  'for that week.',
  'linggo ng kabataan youth week august 12 youth officials counterpart')

# ------------------------------------ Book III: municipality, city, province -
S('475', 'Role of the municipality', 'III',
  'The municipality, consisting of a group of barangays, serves primarily as a '
  'general-purpose government for coordinating and delivering basic, regular and '
  'direct services and for effective governance within its territory.',
  'municipality role what is a municipality purpose town')

S('477', 'Requisites for creating a municipality', 'III',
  'A municipality may be created with an average annual income of at least '
  '₱2,500,000 for the last two consecutive years as certified by the Bureau of '
  'Local Government Finance, a population of at least 25,000 inhabitants certified '
  'by the Philippine Statistics Authority, and a contiguous territory of at least 50 '
  'square kilometers certified by the environment ministry — without dropping the '
  'original municipality below those minimums. The land area requirement does not '
  'apply where the new municipality is made up of one or more islands. Creation also '
  'requires the donation of a lot of not less than 15,000 square meters for a '
  'permanent government center.',
  'create municipality requirements income 2500000 population 25000 50 square '
  'kilometers 15000 square meters new town')

S('478', 'Creation of a tribal municipality', 'III',
  'A tribal municipality may be created by act of Parliament for communities of '
  'non-Moro indigenous peoples who are a minority in their province but native to '
  'it, despite the ordinary population requirement, provided the population is not '
  'less than 20,000, the indigenous peoples are the predominant population and the '
  'area is contiguous. The Bangsamoro Government funds it until it qualifies for the '
  'National Tax Allotment.',
  'tribal municipality indigenous non moro 20000 create minority')

S('480', 'Powers, functions, services and facilities of the municipality', 'III',
  'The municipality delivers services across eighteen fields, among them: '
  'agriculture, including seed farms, communal irrigation, post-harvest facilities, '
  'slaughterhouses, enforcement of fishery laws in municipal waters and licenses for '
  'fishing vessels of three tons or less; health, running municipal health centers '
  'and a medical assistance program; social services, establishing the Persons '
  'with Disabilities Affairs Office, the Office of Senior Citizens’ Affairs and '
  'the Local Youth Development Office; environment, including the municipal solid '
  'waste management board and plan, a materials recovery facility, communal forests '
  'of up to 50 square kilometers and a municipal climate change action plan; '
  'infrastructure, from municipal roads and markets to public cemeteries; disaster '
  'risk reduction; public order, including the People’s Law Enforcement Board and '
  'mechanisms to settle rido; education, through the municipal school board; trade, '
  'through Negosyo Centers, the Business One-Stop Shop and barangay micro business '
  'enterprise certificates; tourism; labour, through the Public Employment Service '
  'Office; transport, franchising tricycles and permitting telecommunication towers; '
  'housing, adopting the comprehensive land use plan and zoning ordinances; science '
  'and technology; tax modernisation; cooperatives; human rights, through a municipal '
  'Human Rights Action Center; and culture and the arts.',
  'municipality services what does a municipality do functions health tricycle '
  'zoning clup negosyo peso solid waste cemetery')

S('481', 'Officials of the municipal government', 'III',
  'Every municipality has a mayor, a vice mayor and sangguniang bayan members. It '
  'must also have a secretary to the sanggunian, a treasurer, an assessor, an '
  'accountant, a budget officer, a planning and development coordinator, an engineer '
  'who is also the building official, a health officer, a nutrition action officer, a '
  'civil registrar, an agriculturist, an environment and natural resources officer, '
  'a social welfare and development officer, an information officer, an '
  'administrator, a disaster risk reduction and management officer, a local youth '
  'development officer, a cooperatives development officer, a senior citizens affairs '
  'officer and a persons with disability affairs officer — though fourth to sixth '
  'class municipalities may designate a focal person instead of the last. It may also '
  'appoint a legal officer, a population officer, an architect, a veterinarian, a '
  'human resources management officer, a local economic investment promotion officer, '
  'a community-based training for enterprise development officer, a local '
  'women’s development officer, an information and communications technology '
  'officer and a tourism officer — the tourism officer being mandatory where the '
  'municipality has major tourism industries.',
  'municipal officials mandatory optional offices who works at the municipal hall '
  'treasurer assessor engineer health officer list of officials')

S('485', 'Compensation of the municipal mayor', 'III',
  'The municipal mayor receives a minimum monthly compensation corresponding to '
  'salary grade 27.',
  'mayor salary how much municipal mayor pay salary grade 27')

S('486', 'Powers and duties of the vice mayor', 'III',
  'The vice mayor presides over the sangguniang bayan and signs all warrants drawn '
  'on the municipal treasury for its operations, appoints all officials and employees '
  'of the sanggunian subject to civil service rules, assumes the office of mayor for '
  'the unexpired term in a permanent vacancy, and exercises the mayor’s powers in '
  'a temporary vacancy.',
  'vice mayor powers duties preside appoint sanggunian staff')

S('487', 'Compensation of the vice mayor', 'III',
  'The municipal vice mayor receives a monthly compensation corresponding to salary '
  'grade 25.',
  'vice mayor salary pay salary grade 25')

S('488', 'Composition of the sangguniang bayan', 'III',
  'The sangguniang bayan is composed of the municipal vice mayor as presiding '
  'officer, the regular sanggunian members, the president of the municipal chapter '
  'of the liga ng mga barangay, the president of the pambayang pederasyon ng mga '
  'sangguniang kabataan, and three sectoral representatives — one from women, one '
  'from agricultural or industrial workers, and one from the urban poor, indigenous '
  'cultural communities or persons with disabilities. Where indigenous peoples are at '
  'least 5% of the population but hold not more than 50% of elective offices, or a '
  'recognized native title lies in the municipality, the third sectoral seat goes to '
  'them. A further seat is guaranteed for settler communities where they are at '
  'least 5% of the population.',
  'sangguniang bayan composition councilors members sectoral representative '
  'liga sk president settler indigenous seat')

S('489', 'Powers, duties and functions of the sangguniang bayan', 'III',
  'The sangguniang bayan enacts ordinances and appropriates funds for the general '
  'welfare. It reviews all ordinances of its barangays and the executive orders of '
  'their punong barangays; may enact ordinances imposing a fine of not more than '
  '₱5,000 or imprisonment of not more than six months, or both; determines the '
  'positions and salaries of municipal employees; provides legal assistance to '
  'barangay officials, tanods and lupon members who must sue or defend themselves '
  'over their official duties; and may provide group insurance for barangay officials '
  'and tanods where municipal finances allow.',
  'sangguniang bayan powers fine 5000 six months ordinance review barangay '
  'legal assistance insurance')

S('490', 'Compensation of sangguniang bayan members', 'III',
  'Members of the sangguniang bayan receive a minimum monthly compensation '
  'corresponding to salary grade 24.',
  'councilor salary sangguniang bayan member pay salary grade 24')

S('492', 'Classification of cities', 'III',
  'A city may be component, independent component or highly urbanised. The '
  'criteria do not affect the classification and corporate status of cities that '
  'already exist.',
  'city types classification component independent highly urbanized')

S('493', 'Independent component cities', 'III',
  'Independent component cities are component cities whose charters prohibit their '
  'voters from voting for provincial elective officials. They are independent of the '
  'province.',
  'independent component city cannot vote governor cotabato city icc independent')

S('494', 'Highly urbanized cities', 'III',
  'Cities with a minimum population of 200,000 inhabitants certified by the '
  'Philippine Statistics Authority and a latest annual income of at least '
  '₱50,000,000 based on 1991 constant prices are classified as highly urbanised.',
  'highly urbanized city requirements 200000 population 50 million income huc')

S('495', 'Component cities', 'III',
  'Cities that do not meet the requirements for a highly urbanised city are '
  'component cities of the province they are geographically in. A component city '
  'lying within two or more provinces is a component of the province it used to be a '
  'municipality of.',
  'component city definition province part of')

S('496', 'Powers and functions of the city', 'III',
  'A city government performs the same powers and functions and delivers the same '
  'basic services and facilities as both a municipality and a province.',
  'city powers services same as municipality province what does a city do')

S('505', 'Compensation of the city mayor', 'III',
  'The city mayor receives a minimum monthly compensation corresponding to salary '
  'grade 30.',
  'city mayor salary pay salary grade 30')

S('507', 'Compensation of the city vice mayor', 'III',
  'The vice mayor of a component city receives compensation corresponding to salary '
  'grade 26, and of a highly urbanised city to salary grade 28.',
  'city vice mayor salary grade 26 28 pay')

S('509', 'Powers of the sangguniang panlungsod', 'III',
  'The sangguniang panlungsod exercises within its jurisdiction the powers, duties '
  'and functions of both a sangguniang bayan and a sangguniang panlalawigan, and may '
  'enact ordinances imposing a fine of not more than ₱5,000, imprisonment of not '
  'more than one year, or both, for violating a city ordinance.',
  'sangguniang panlungsod powers fine 5000 one year city council')

S('510', 'Compensation of sangguniang panlungsod members', 'III',
  'Members of the sangguniang panlungsod of a component city receive compensation '
  'corresponding to salary grade 25, and of a highly urbanised city to salary grade '
  '27.',
  'city councilor salary grade 25 27 pay')

S('511', 'Role of the province', 'III',
  'The province is a political and corporate unit of government serving as a dynamic '
  'mechanism for developmental processes and for the effective governance of the '
  'local government units within its territory.',
  'province role what is a province purpose')

S('512', 'Powers, functions, services and facilities of the province', 'III',
  'The province delivers services across eighteen fields, among them: agriculture, '
  'including dairy farms, breeding stations, inter-municipal irrigation and the '
  'provincial agriculture database; health, operating provincial and district '
  'hospitals and other tertiary services; social services, augmenting its component '
  'units and licensing social welfare agencies with the MSSD; environment, chairing '
  'the provincial solid waste management board, enforcing forestry laws, regulating '
  'small-scale mining and issuing quarry permits of up to five hectares; '
  'infrastructure, including provincial roads and bridges, piers, jails and '
  'inter-municipal waterworks; disaster risk reduction; public order, including '
  'alternative dispute mechanisms for rido between residents of different '
  'municipalities; education through the provincial school board; trade and '
  'investment; tourism; labour; transport; housing, reviewing and approving the land '
  'use plans of its component cities and municipalities; science and technology; tax '
  'modernisation; cooperatives; human rights; and culture and the arts.',
  'province services what does a province do functions hospital roads quarry '
  'forestry land use plan review')

S('513', 'Officials of the provincial government', 'III',
  'Every province has a governor, a vice governor and members of the sangguniang '
  'panlalawigan. It must also have a secretary to the sanggunian, a treasurer, an '
  'assessor, an accountant, an engineer, a budget officer, a planning and development '
  'coordinator, a legal officer, an administrator, a health officer, a social welfare '
  'and development officer, a nutrition action officer, a general services officer, '
  'an agriculturist, a veterinarian, a disaster risk reduction and management '
  'officer, a tourism officer, an environment and natural resources officer, a '
  'cooperative development officer, a persons with disability affairs officer, a '
  'youth development officer and an information officer. It may also appoint an '
  'architect, a population officer, a human resources management officer, a local '
  'economic investment promotion officer, a community-based training for enterprise '
  'development officer and a communications technology officer.',
  'provincial officials capitol offices mandatory optional governor staff list')

S('515', 'Residence and office of provincial officials', 'III',
  'The governor keeps an official residence in the provincial capital, and all '
  'elective and appointive provincial officials hold office there — though on a '
  'resolution of the sangguniang panlalawigan they may hold office in a component '
  'city or municipality for not more than seven days in any month.',
  'governor residence capital office seven days component city')

S('517', 'Compensation of the provincial governor', 'III',
  'The provincial governor receives a minimum monthly compensation corresponding to '
  'salary grade 30.',
  'governor salary pay how much salary grade 30')

S('519', 'Compensation of the provincial vice governor', 'III',
  'The vice governor receives a monthly compensation corresponding to salary grade '
  '28.',
  'vice governor salary pay salary grade 28')

S('521', 'Powers of the sangguniang panlalawigan', 'III',
  'The sangguniang panlalawigan enacts ordinances and appropriates funds for the '
  'general welfare of the province. It reviews the ordinances of component city and '
  'municipal sanggunians and the executive orders of their mayors; may approve '
  'ordinances imposing a fine of not more than ₱5,000, imprisonment of not more '
  'than one year, or both; authorises the governor to contract loans on a majority '
  'vote of all its members; and may establish a scholarship fund for poor but '
  'deserving students.',
  'sangguniang panlalawigan powers fine 5000 one year review ordinance scholarship')

S('522', 'Compensation of sangguniang panlalawigan members', 'III',
  'Members of the sangguniang panlalawigan receive a minimum monthly compensation '
  'corresponding to salary grade 27.',
  'board member salary provincial board pay salary grade 27')

# ------------------------ Book III, Title V: appointive officials -----------
S('523', 'Secretary to the sanggunian', 'III',
  'Every province, city and municipality must have a secretary to the sanggunian, a '
  'career official with the rank and salary of a department head, appointed by the '
  'vice governor or vice mayor. The secretary keeps the journal and the seal, '
  'forwards ordinances for approval and review, records and translates ordinances '
  'into the dialect used by most inhabitants, furnishes certified copies on request, '
  'and takes custody of the local archives and library.',
  'secretary to the sanggunian duties qualifications journal minutes translate')

S('524', 'The treasurer', 'III',
  'The treasurer is appointed by the Secretary of Finance from at least three '
  'ranking eligible recommendees of the governor or mayor, and is mandatory for '
  'every province, city and municipality. The post requires a college degree, '
  'treasurer eligibility, and at least five years of treasury or accounting '
  'experience for a city or province and three for a municipality. The treasurer '
  'takes custody of and disburses local funds, inspects commercial establishments '
  'for tax purposes, maintains the tax information system, and reports collections '
  'to the finance ministry; a provincial treasurer exercises technical supervision '
  'over the treasuries of component cities and municipalities.',
  'treasurer appointment qualifications duties collect taxes disburse funds')

S('526', 'The assessor', 'III',
  'An assessor is mandatory for every province, city and municipality, and must hold '
  'a relevant college degree, a real estate service license, and at least five '
  'years’ assessment experience for a city or province and three for a '
  'municipality. The assessor appraises and assesses all real property for taxation, '
  'maintains tax mapping and a property identification system, conducts physical '
  'surveys, and prepares the schedule of fair market values.',
  'assessor duties qualifications property valuation tax mapping')

S('528', 'The accountant', 'III',
  'An accountant is mandatory for every province, city and municipality and must be '
  'a certified public accountant with at least five years’ experience for a '
  'province or city and three for a municipality. The accountant installs and '
  'maintains the internal audit system, prepares financial statements, certifies the '
  'availability of budgetary allotments, and keeps the ledgers and records of '
  'disbursements and obligations.',
  'accountant cpa duties internal audit financial statements')

S('529', 'The budget officer', 'III',
  'A budget officer is mandatory for every province, city and municipality, with a '
  'relevant college degree, second level civil service eligibility, and at least '
  'five years’ budgeting experience for a province or city and three for a '
  'municipality. The officer consolidates departmental budget proposals, assists in '
  'preparing the budget and in budget hearings, and reports to the DBM and the '
  'finance ministry.',
  'budget officer duties qualifications budget preparation')

S('530', 'The planning and development coordinator', 'III',
  'A planning and development coordinator is mandatory for every province, city and '
  'municipality, and must be a licensed environmental planner with at least five '
  'years’ experience for a province or city and three for a municipality. The '
  'coordinator formulates the integrated development plans and policies, monitors '
  'and evaluates programs against the plan, analyzes income and expenditure '
  'patterns for the finance committee, and heads the secretariat of the local '
  'development council.',
  'planning development coordinator mpdc duties environmental planner')

S('531', 'The engineer and building official', 'III',
  'An engineer is mandatory for every province, city and municipality and must be a '
  'licensed civil engineer with at least five years in practice for a province or '
  'city and three for a municipality. The city and municipal engineer also acts as '
  'the local building official. The engineer administers the construction and repair '
  'of roads, bridges and public works, and provides survey, design, feasibility and '
  'project management services; a provincial engineer exercises technical supervision '
  'over component engineering offices.',
  'engineer building official duties permit civil engineer roads')

S('532', 'The health officer', 'III',
  'A health officer must be a licensed medical practitioner with at least five '
  'years’ practice for a province or city and three for a municipality, and the '
  'appointment is mandatory for provincial and city governments. The officer '
  'formulates health and nutrition policies, enforces sanitation and public health '
  'laws, directs sanitary inspection of food establishments and accommodations, and '
  'must be in the frontline of health service delivery during and after disasters; a '
  'provincial health officer supervises the health officers of component cities and '
  'municipalities.',
  'health officer doctor duties sanitation inspection mandatory')

S('533', 'The civil registrar', 'III',
  'A civil registrar is mandatory for city and municipal governments, requiring a '
  'college degree, second level eligibility and at least five years’ civil '
  'registry experience in a city and three in a municipality. The registrar accepts '
  'and files registrable documents and judicial decrees affecting civil status, '
  'issues certified copies, and receives applications for marriage licenses, issuing '
  'them once the requirements and publication are complete.',
  'civil registrar birth certificate marriage license death duties')

S('534', 'The administrator', 'III',
  'An administrator is mandatory for every province, city and municipality and holds '
  'office coterminous with the appointing authority, requiring a relevant college '
  'degree, second level eligibility and at least five years’ management '
  'experience for a province or city and three for a municipality. The administrator '
  'coordinates the work of all officials, maintains a sound personnel program, and '
  'conducts continuing organizational development.',
  'administrator coterminous duties coordinate personnel')

S('535', 'The legal officer', 'III',
  'A legal officer must be a member of the Philippine Bar with at least five '
  'years’ practice for a province or city and three for a municipality, holds '
  'office coterminous with the appointing authority, and is mandatory for provincial '
  'and city governments but optional for municipalities. The legal officer represents '
  'the unit in civil actions, drafts ordinances and contracts, renders written legal '
  'opinions, investigates officials for neglect or misconduct, and must be in the '
  'frontline of protecting human rights and prosecuting violations.',
  'legal officer lawyer duties mandatory optional municipality represent')

S('536', 'The agriculturist', 'III',
  'An agriculturist is mandatory for every province, city and municipality, '
  'requiring a degree in agriculture, agriculturist eligibility and at least five '
  'years’ practice for a province or city and three for a municipality. The '
  'agriculturist ensures farmers, fishers and local entrepreneurs have access to '
  'production, processing and marketing resources, conducts location-specific '
  'research, and must be in the frontline of delivering the agricultural services '
  'inhabitants need to survive a disaster.',
  'agriculturist duties farmers fishers mandatory extension')

S('537', 'The social welfare and development officer', 'III',
  'A social welfare and development officer is mandatory for every province, city '
  'and municipality and must be a duly licensed social worker with at least five '
  'years’ practice for a province or city and three for a municipality. The '
  'officer identifies the needs of the disadvantaged, provides crisis intervention '
  'for victims of abuse and exploitation, runs welfare programs for persons with '
  'disabilities and the elderly and for preventing juvenile delinquency, and must be '
  'in the frontline of relief during and after disasters.',
  'social welfare officer mswdo social worker duties abuse relief')

S('538', 'The environment and natural resources officer', 'III',
  'An environment and natural resources officer is mandatory for every province, '
  'city and municipality, requiring a relevant college degree, second level '
  'eligibility, and at least five years’ experience for a province or city and '
  'three for a municipality. The officer establishes and protects communal forests, '
  'watersheds, tree parks, mangroves and greenbelts, maintains seed banks and '
  'seedling production, and coordinates measures to prevent land, air and water '
  'pollution.',
  'environment officer enro duties forests mangroves pollution mandatory')

S('540', 'The information officer', 'III',
  'An information officer is mandatory for every province, city and municipality, '
  'holds office coterminous with the appointing authority, and requires a relevant '
  'degree, second level eligibility and at least three years’ experience writing '
  'for print or broadcast in a province or city and one year in a municipality. The '
  'officer provides relevant and timely information to residents and must be in the '
  'frontline of providing information during and after disasters, to minimise '
  'casualties and accelerate relief.',
  'information officer pio duties coterminous disaster information')

S('541', 'The cooperatives and social enterprise development officer', 'III',
  'A cooperatives development officer is mandatory for every province, city and '
  'municipality, requiring a relevant degree with special training in cooperatives, '
  'second level eligibility, and at least five years’ experience for a province '
  'or city and three for a municipality. The officer identifies groups that can be '
  'organized into cooperatives, assists them through registration with the '
  'Cooperative and Social Enterprise Authority, and helps them build risk management '
  'and business continuity plans.',
  'cooperative officer duties csea register cooperative mandatory')

S('543', 'The veterinarian', 'III',
  'A veterinarian must be a licensed Doctor of Veterinary Medicine with at least '
  'three years’ practice for a province or city and one for a municipality. The '
  'appointment is mandatory for provincial and city governments and optional for '
  'municipalities. The veterinarian advises on the slaughter of animals for human '
  'consumption, regulates slaughterhouses and the keeping of domestic animals, '
  'inspects poultry and dairy products, and takes measures to eradicate animal '
  'diseases.',
  'veterinarian duties slaughterhouse animals mandatory optional')

S('544', 'The general services officer', 'III',
  'A general services officer is mandatory for every province, city and '
  'municipality, requiring a relevant degree, second level eligibility, and at least '
  'five years’ experience for a province or city and three for a municipality. '
  'The officer takes custody of and is accountable for all property owned by the '
  'unit, assigns building space, maintains janitorial and security services, and '
  'performs archival and records management.',
  'general services officer gso property custodian records duties')

S('545', 'The information and communications technology officer', 'III',
  'An ICT officer is optional for local government units and requires a degree in '
  'information and communications technology, computer science, computer '
  'engineering, data science or electronics and communications engineering, second '
  'level eligibility, and at least five years’ experience for a province or city '
  'and three for a municipality. The officer drives the digitisation of public '
  'documents, the digitalisation of government processes and the unit’s overall '
  'digital transformation, and maintains its ICT programs and databases.',
  'ict officer it officer digital transformation optional duties computer')

S('546', 'The tourism officer', 'III',
  'A tourism officer must hold a relevant bachelor’s degree, second level '
  'eligibility and at least five years of substantial involvement in the tourism '
  'industry. The appointment is mandatory for provincial governments and optional '
  'for cities and municipalities — but mandatory for a city or municipality with '
  'major tourism industries. The officer prepares and updates the local tourism '
  'development plan and enforces tourism laws and standards.',
  'tourism officer mandatory optional duties tourism plan')

S('547', 'The local women’s development officer', 'III',
  'A Local Women’s Development Officer may be appointed in each local government '
  'unit to address the concerns of women and promote their representation, '
  'participation, welfare and development, with qualifications set by the unit under '
  'guidelines from the Bangsamoro Women Commission. The officer supports the local '
  'women’s development council, runs capacity-building on gender equity and '
  'women’s rights, is allocated a budget for staffing and programs, and '
  'establishes a mechanism for monitoring and reporting.',
  'women development officer lwdo gender duties bangsamoro women commission')

S('548', 'The nutrition action officer', 'III',
  'A nutrition action officer is mandatory for every province, city and municipality '
  'and must be a duly licensed nutritionist-dietitian with at least five '
  'years’ practice for a province or city and three for a municipality. The '
  'officer manages the local nutrition program, schedules the quarterly meetings of '
  'the local nutrition committee, prepares the local nutrition action plan, mobilises '
  'the nutrition cluster during disasters and emergencies, and reviews the results of '
  'the program for weighing and measuring children.',
  'nutrition action officer mandatory nutritionist duties feeding malnutrition')

S('549', 'The librarian', 'III',
  'A librarian is optional for provincial, city and municipal governments and must '
  'hold librarian eligibility with at least two years’ practice for a province or '
  'city and one for a municipality. The librarian selects and acquires multi-media '
  'sources, catalogs and classifies collections, develops computer-assisted '
  'information systems, and organizes the conservation and restoration of historical '
  'and cultural documents.',
  'librarian optional library duties books')

# ---------------------------------- Book III, Title VI: leagues -------------
S('550', 'Liga ng mga Barangay sa Bangsamoro', 'III',
  'All barangays in BARMM are organized into the Liga ng mga Barangay sa '
  'Bangsamoro, to determine the liga’s representation in the sanggunians and to '
  'ventilate and resolve issues of barangay administration. Each barangay is '
  'represented by its punong barangay, and the liga has chapters at municipal, city, '
  'provincial and regional level.',
  'liga ng mga barangay association punong barangay chapters representation')

S('553', 'Ex officio membership of liga presidents', 'III',
  'The elected presidents of the liga ng mga barangay at municipal, city and '
  'provincial level serve as ex officio members of the sangguniang bayan, panlungsod '
  'and panlalawigan respectively, for as long as they are liga presidents and never '
  'beyond the term of the sanggunian concerned.',
  'liga president councilor ex officio sanggunian seat abc president')

S('555', 'League of Municipalities in the Bangsamoro', 'III',
  'All municipalities in the Bangsamoro form the League of Municipalities in the '
  'Bangsamoro to ventilate and resolve issues of municipal administration, with '
  'provincial chapters and a regional chapter that affiliates with the national '
  'league.',
  'league of municipalities lmp association mayors')

S('558', 'Bangsamoro League of Cities', 'III',
  'All cities in BARMM form the Bangsamoro League of Cities to ventilate and resolve '
  'issues of city government administration, affiliating with and forming part of '
  'the national league.',
  'league of cities association city mayors')

S('561', 'Bangsamoro League of Provinces', 'III',
  'All provinces in the Bangsamoro form the Bangsamoro League of Provinces to '
  'ventilate and resolve issues of provincial administration, affiliating with and '
  'forming part of the national league.',
  'league of provinces association governors')

S('565', 'Funding of the leagues', 'III',
  'Leagues draw funds from the contributions of member local government units and '
  'from fund-raising projects that need no permit, with proceeds used primarily for '
  'the projects they were raised for. League funds are deposited as trust funds with '
  'a bonded treasurer, and municipal, city, provincial and regional governments may '
  'augment them.',
  'league funding contributions fund raising trust fund')

# ---------------------------------------------- Book IV: penal and final ----
S('571', 'Posting and publication of penal ordinances', 'IV',
  'Ordinances with penal sanctions are posted at three conspicuous places in the '
  'capitol or the city, municipal or barangay hall for at least six consecutive '
  'weeks, published where a newspaper is available, and take effect the day after '
  'publication or at the end of the posting period, whichever is later. The '
  'sanggunian secretary transmits official copies to the Bangsamoro Gazette within 12 '
  'days of approval, and publication includes translation into local languages.',
  'penal ordinance posting six weeks publish gazette translation effect')

S('572', 'Withholding of benefits', 'IV',
  'Wilfully and maliciously withholding any benefit the Code accords to barangay, '
  'municipal, city or provincial officials and employees is punished by suspension '
  'or dismissal from office of the official responsible.',
  'withhold honorarium salary benefits punishment dismissal captain not paid')

S('573', 'Failure to post the itemized monthly collections and disbursements', 'IV',
  'A local treasurer or chief accountant who fails to post the unit’s itemised '
  'monthly collections and disbursements within 10 days of the month’s end, for at '
  'least two consecutive weeks at prominent places in the main office building, the '
  'plaza and the main street, and to publish the itemisation, is punished by a fine '
  'of not less than ₱40,000 and not more than ₱1,200,000, or by suspension or '
  'imprisonment of not more than one year, or both.',
  'treasurer fine not posting monthly collections 40000 1200000 transparency '
  'punishment jail')

S('574', 'Prohibited business transactions and illegal pecuniary interest', 'IV',
  'A local official — and any person dealing with them — who violates the '
  'prohibitions on business and pecuniary interest is punished by imprisonment of six '
  'months and one day to six years, or a fine of not less than ₱40,000 and not '
  'more than ₱1,200,000, or both.',
  'conflict of interest penalty jail fine 40000 1200000 corruption punishment')

S('575', 'Refusal to appear before the lupon or pangkat', 'IV',
  'Refusal or wilful failure to appear before the lupon or pangkat under a summons '
  'may be punished by the city or municipal court as indirect contempt. It also bars '
  'a complainant who fails to appear from going to court on the same cause of action, '
  'and a respondent who refuses from filing any counterclaim connected with the '
  'complaint.',
  'ignore barangay summons penalty contempt refuse to appear consequence')

S('576', 'Penalties for violation of tax ordinances', 'IV',
  'A sanggunian may prescribe fines for violating tax ordinances of not less than '
  '₱40,000 and not more than ₱1,200,000, and imprisonment of not less than one '
  'month and not more than six months. A sangguniang barangay may prescribe a fine of '
  'not less than ₱1,000 and not more than ₱10,000.',
  'tax ordinance violation fine 40000 1200000 barangay 1000 10000 penalty')

S('577', 'Omission of property from assessment or tax rolls', 'IV',
  'An assessor who wilfully fails to assess taxable property, omits it from the roll, '
  'under-assesses it or fails to perform an assessment duty is punished on conviction '
  'by a fine of not less than ₱40,000 and not more than ₱1,200,000, or by '
  'suspension or imprisonment of one to six months, or both. The same penalty falls '
  'on a collecting officer who wilfully or negligently fails to collect the tax.',
  'assessor penalty omit property under assess fine jail 40000')

S('580', 'Prohibited acts in credit-financed contracts', 'IV',
  'It is unlawful for a local official or employee — or a relative within the fourth '
  'civil degree — to have any pecuniary interest in a contract for a project awarded '
  'under the credit financing provisions or in supplying it. Anyone convicted is '
  'removed from office and punished by imprisonment of not less than two months and '
  'not more than three years.',
  'bot contract relative interest penalty removal jail infrastructure corruption')

S('582', 'Non-compliance with the gender and development plan', 'IV',
  'Failing to submit the GAD Plan for two consecutive fiscal years, failing to submit '
  'the accomplishment report on its use, and failing to establish the Gender Focal '
  'Point System are each dereliction of duty, a ground for disciplinary action '
  'against the official responsible.',
  'gad plan gender failure dereliction penalty focal point')

S('584', 'Misuse of the gender and development budget', 'IV',
  'Using the GAD budget for purposes beyond those contemplated in the GAD Plan '
  'constitutes abuse of authority on the part of the local chief executive.',
  'gad budget misuse abuse of authority gender funds')

S('586', 'Parliamentary oversight and mandatory review', 'IV',
  'The Bangsamoro Parliament, through its Committee on Local Government, oversees '
  'the implementation of the Code and must review it 10 years after enactment and at '
  'least every three years after that. The Code may be amended only on the results '
  'of a completed mandatory review.',
  'review code amend ten years oversight committee')

S('587', 'Insurance coverage for barangay officials', 'IV',
  'There shall be a system providing insurance coverage for the punong barangay, '
  'sangguniang barangay members, the barangay secretary and treasurer, barangay '
  'tanods and members of the Barangay Peacekeeping Action Team. The MILG, with the '
  'GSIS or other institutions, undertakes an actuarial study of the premiums payable '
  'and reports the appropriations needed.',
  'barangay insurance tanod coverage gsis actuarial')

S('588', 'Personnel retirement and separation benefits', 'IV',
  'An official or employee separated as a result of a reorganization under the Code '
  'receives the retirement benefits they are entitled to. Where not eligible to '
  'retire, they receive separation pay of not less than one month’s salary for '
  'every year of service, over and above the monetary value of their leave credits.',
  'separation pay retirement reorganization one month per year devolution')

S('592', 'Devolution Committee and the devolution period', 'IV',
  'Within a month of the Code’s approval the Chief Minister convenes a Devolution '
  'Committee chaired by the Senior Minister, with the MILG Minister as vice chair, '
  'the Cabinet, the Committee on Local Government chair and five Members of '
  'Parliament, and one representative each from the provinces, the municipalities and '
  'the barangays. It supervises the transfer of powers, functions, assets and '
  'liabilities to local government units. Its technical working group had six months '
  'to assess whether units could carry the devolved functions and three months more '
  'to submit a devolution plan. An initial ₱10,000,000 was allotted for its work.',
  'devolution committee senior minister six months plan 10 million transfer functions')

S('595', 'Transitory provision on anti-dynasty and mandatory training', 'IV',
  'Section 43 on mandatory training and Section 45(g), the anti-dynasty '
  'disqualification, apply only starting with the May 2028 elections.',
  'anti dynasty when effective 2028 training start applies elections')

S('596', 'Transitory provision for incumbent appointive officials', 'IV',
  'Appointive officials holding permanent appointments before the Code took effect '
  'continue in their functions without reappointment and without diminution of '
  'status, rank or salary grade, and keep security of tenure — but may not be '
  'promoted unless they meet the eligibility requirements for the higher position.',
  'incumbent appointive official tenure promotion eligibility existing employees')

S('599', 'Transitory provisions for the municipalities in the Special Geographic Area', 'IV',
  'The 63 barangays of Pikit, Pigkawayan, Carmen, Kabacan, Midsayap and Aleosan in '
  'Cotabato province that voted to join the Bangsamoro are constituted into eight '
  'municipalities under Bangsamoro Autonomy Acts 41 to 48. Until then the Special '
  'Geographic Area continues to be governed under the Bangsamoro Administrative '
  'Code. On their conversion the eight municipalities form the SGA as a cluster under '
  'the general supervision of the Chief Minister, and the Special Geographic Area '
  'Development Authority is reorganized as an inter-municipal mechanism attached to '
  'the Office of the Chief Minister, governed by a board of all the SGA mayors and '
  'the Bangsamoro ministers, chaired by the Senior Minister, and exercising the '
  'powers devolved to provinces pending the creation of a province.',
  'special geographic area sga 63 barangays eight municipalities cotabato pikit '
  'midsayap kabacan carmen pigkawayan aleosan authority province')

S('600', 'Additional taxing powers of the municipalities in the Special Geographic Area', 'IV',
  'Until a province is constituted for them, the municipalities of the Special '
  'Geographic Area may levy the real property tax and the professional tax, which '
  'ordinarily belong to provinces. Their initial rates may not be higher than those '
  'already prevailing in those areas before they joined BARMM, though they may be '
  'adjusted afterwards.',
  'sga taxes real property professional tax municipalities province powers')

S('601', 'Creation of a new province for the Special Geographic Area', 'IV',
  'The provisions on the Special Geographic Area and its Development Authority '
  'remain operational until a new province is constituted for the SGA '
  'municipalities. Personnel affected are given the option to be absorbed by the new '
  'local government unit or separated in accordance with law.',
  'sga new province create future thirteenth province personnel absorb')

S('602', 'Implementing rules and regulations', 'IV',
  'The MILG, in consultation with Bangsamoro and local government stakeholders, '
  'promulgates the implementing rules and regulations within three months of the '
  'Code taking effect.',
  'irr implementing rules three months milg')

S('603', 'Repealing clause', 'IV',
  'Muslim Mindanao Autonomy Act 25, the Local Government Code of the Autonomous '
  'Region in Muslim Mindanao, is repealed. Provisions of the Bangsamoro '
  'Administrative Code inconsistent with this Code are repealed or amended, as are '
  'all other issuances inconsistent with it.',
  'repeal mmaa 25 armm code replaced old code')

S('605', 'Effectivity clause', 'IV',
  'The Code takes effect immediately following its complete publication in at least '
  'one newspaper of general circulation in BARMM. It was approved by Chief Minister '
  'Ahod Balawag Ebrahim on 28 September 2023.',
  'effectivity when did it take effect published approved ebrahim 2023')

# The Code runs the whole chapter without once writing "katarungang
# pambarangay", which is the only name anybody knows the barangay justice
# system by.
for _s in SECTIONS:
    if _s['n'].isdigit() and 427 <= int(_s['n']) <= 449:
        _s['terms'] += ' katarungang pambarangay barangay justice settle dispute reklamo'

# ------------------------------------------------------------------ emit ----
out = {
    'name': 'Bangsamoro Local Governance Code of 2023',
    'act': 49,
    'enacted': '2023-09-28',
    'source': {
        'label': 'Bangsamoro Autonomy Act 49 — Bangsamoro Local Governance Code',
        'href': 'https://parliament.bangsamoro.gov.ph/bta-acts/an-act-providing-for-the-bangsamoro-local-governance-code/',
    },
    'note': (
        'The operative sections of the Code, written out with their figures. It is '
        '605 sections across four Books; these are the ones that carry a rule '
        'somebody asks about. Where the Code is silent the national Local Government '
        'Code and other national law still apply, and Muslim Mindanao Autonomy Act '
        '25 — the ARMM code this replaced — is repealed outright.'
    ),
    'sections': SECTIONS,
}

seen = {}
for s in SECTIONS:
    if s['n'] in seen:
        raise SystemExit(f"duplicate section {s['n']}")
    seen[s['n']] = True
    if not s['rule'] or not s['heading']:
        raise SystemExit(f"section {s['n']} is missing its rule or heading")

dest = pathlib.Path(__file__).resolve().parents[1] / 'blgc.json'
dest.write_text(json.dumps(out, indent='\t', ensure_ascii=False) + '\n')
books = {}
for s in SECTIONS:
    books[s['book']] = books.get(s['book'], 0) + 1
print(f"{len(SECTIONS)} sections -> {dest}")
print('by book:', books)
print(f"{dest.stat().st_size/1024:.0f} KB")
