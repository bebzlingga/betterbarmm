#!/usr/bin/env python3
"""Write datasets/bills/blgc-irr.json — the operative articles of the
Implementing Rules and Regulations of the Bangsamoro Local Governance Code of
2023, promulgated 30 September 2025 by the Ministry of the Interior and Local
Government.

The IRR is 696 Articles. It is a companion to datasets/bills/blgc.json and not
a replacement for it: the Code says what the rule is, the IRR says how it is
done — who files the petition, on what form, within how many days, against
which table of rates. That procedural half is most of what a person actually
asks, and none of it is in the Code.

Two numbering systems run side by side and do not line up. Code Section 424 and
IRR Article 45 are the same subject; the Article number is never the Section
number. Every row here is titled as an Article so the assistant cites it as
one.

Fields are the Code script's, less `book` — the IRR is organized in Rules, and
the Rule number is in `rule_no` for the record:

  rule    the article as a rule, with its figures written in. The assistant
          quotes this and may not state a figure that was not in it.
  terms   the words a question uses that the IRR does not — cedula, amilyar,
          barangay captain, kagawad, sangguniang kabataan.

An article that only repeats its Code section verbatim is left out; what is
here either adds a procedure, a deadline, a table, or covers ground the Code
rows do not reach.

    python3 datasets/bills/scripts/build_blgc_irr.py
"""
import json, pathlib

ARTICLES = []

def A(n, heading, rule_no, rule, terms=''):
    ARTICLES.append({'n': n, 'heading': heading, 'ruleNo': rule_no,
                     'rule': ' '.join(rule.split()), 'terms': ' '.join(terms.split())})

# ------------------------------------------------- general provisions ----
A('1', 'Title and authority of these Rules', 'I',
  'These are the Implementing Rules and Regulations of the Bangsamoro Local '
  'Governance Code of 2023. They were promulgated on 30 September 2025 by the '
  'Ministry of the Interior and Local Government and run to 696 Articles. They '
  'implement Bangsamoro Autonomy Act 49; they do not amend it, and where an '
  'article and the Code disagree the Code prevails.',
  'irr implementing rules regulations what is the irr when promulgated 2025 milg')

A('2', 'Purpose of these Rules', 'I',
  'The Rules are issued to carry out the Bangsamoro Local Governance Code of '
  '2023 — to guide local government units, their officials and the ministries '
  'in applying it, and to supply the procedures, forms and standards the Code '
  'leaves to implementation.',
  'purpose why an irr exists what is it for')

A('4', 'Scope of these Rules', 'I',
  'The Rules apply to all provinces, cities, municipalities and barangays of '
  'the Bangsamoro Autonomous Region, to the Special Geographic Area, and to '
  'every Bangsamoro ministry, office and agency dealing with them.',
  'who does the irr cover apply scope special geographic area')

A('5', 'Rules of interpretation', 'I',
  'Doubt about a power of a local government unit is resolved in its favor, '
  'and in favor of the lower unit. A tax ordinance is construed strictly '
  'against the unit that enacted it and liberally in favor of the taxpayer. '
  'Where neither the Code nor these Rules nor jurisprudence applies, the '
  'customs and traditions of the place may be resorted to.',
  'how to read interpret doubt ambiguous favor taxpayer customs traditions')

# ------------------------------------------------ creating a barangay ----
A('16', 'Requirements for creating a barangay', 'III',
  'A barangay may be created where the territory has at least 2,000 '
  'inhabitants certified by the Philippine Statistics Authority, a contiguous '
  'territory certified by the provincial or city assessor, and a donated lot of '
  'at least 1,500 square meters for the barangay hall, health station and '
  'multi-purpose court, covered by a deed of donation and a certificate of '
  'title. The 2,000 requirement does not apply to a barangay created in an '
  'indigenous cultural community or in a geographically isolated area.',
  'how to create make a new barangay requirements population 2000 lot size split')

A('17', 'Who may petition to create a barangay', 'III',
  'The petition is filed by at least 50 registered voters of the territory, or '
  'by the sangguniang bayan or sangguniang panlungsod concerned, with the '
  'sangguniang panlalawigan and a copy to the Ministry of the Interior and '
  'Local Government. It is filed in one original and four certified true '
  'copies.',
  'who files petition create barangay 50 voters where to file')

A('18', 'Contents of the petition', 'III',
  'The petition states the name proposed, the barangays or portions affected, '
  'the technical description of the boundaries, and attaches the certifications '
  'on population, territory, income and the donated lot, a map, and the '
  'resolutions of the sanggunians concerned.',
  'what goes in a petition contents requirements documents attachments')

A('19', 'Plebiscite on the creation of a barangay', 'III',
  'No barangay is created, divided, merged, abolished or has its boundary '
  'substantially altered except by a vote of a majority in a plebiscite called '
  'for the purpose in the political units directly affected. The plebiscite is '
  'conducted by the Commission on Elections within 120 days of the effectivity '
  'of the law or ordinance, unless that law or ordinance fixes another date.',
  'plebiscite vote referendum how long 120 days comelec merge abolish')

A('20', 'Return of the plebiscite', 'III',
  'The board of canvassers submits the certificate of canvass and the '
  'proclamation to the sanggunian concerned and to the Ministry of the Interior '
  'and Local Government within seven days of the plebiscite.',
  'result canvass return seven days after plebiscite')

A('22', 'Beginning of corporate existence', 'III',
  'A newly created local government unit begins its corporate existence on the '
  'election and qualification of its chief executive and a majority of its '
  'sanggunian, unless another time is fixed by the law or ordinance creating '
  'it.',
  'when does a new lgu start exist begin corporate existence')

A('24', 'Barangays in indigenous cultural communities', 'III',
  'A barangay in an indigenous cultural community or an area of a tribal people '
  'may be created without meeting the 2,000-inhabitant requirement, on the '
  'endorsement of the tribal or traditional leaders concerned, provided the '
  'other requirements are met.',
  'tribal barangay indigenous ip icc smaller population exemption')

A('27', 'Powers and functions of a barangay', 'IV',
  'A barangay delivers agricultural support including the distribution of '
  'planting materials and the operation of farm produce collection and buying '
  'stations; health and social welfare services including maintenance of a '
  'barangay health center and a day care center; services and facilities for '
  'agriculture and fishery; maintenance of barangay roads, bridges and water '
  'supply systems; an infrastructure of a multi-purpose hall, a multi-purpose '
  'pavement, a plaza, a sports center and other facilities; information and '
  'reading center; and the satellite or public market where viable.',
  'what does a barangay do services functions responsibilities duties')

# ------------------------------------------------- barangay officials ----
A('31', 'The officials of a barangay', 'V',
  'A barangay has a punong barangay, seven sangguniang barangay members, a '
  'sangguniang kabataan chairperson, a barangay secretary and a barangay '
  'treasurer, all constituting the barangay government. The punong barangay and '
  'the seven members are elected at large by the qualified voters; the SK '
  'chairperson sits as an ex officio member of the sangguniang barangay.',
  'kagawad how many barangay captain officials council members composition')

A('36', 'The sangguniang barangay', 'V',
  'The sangguniang barangay is the legislative body of the barangay. It is '
  'composed of the punong barangay as presiding officer, the seven elected '
  'sangguniang barangay members, and the sangguniang kabataan chairperson. A '
  'majority of all its members is a quorum, and it acts by ordinance or '
  'resolution.',
  'kagawad sangguniang barangay council quorum who presides ordinance resolution')

A('45', 'Compensation and benefits of barangay officials', 'V',
  'The punong barangay receives an honorarium of not less than ₱5,000 a month '
  'and not more than the first step of Salary Grade 14. Each sangguniang '
  'barangay member, the barangay secretary, the barangay treasurer and the '
  'sangguniang kabataan chairperson receives not less than ₱3,000 a month and '
  'not more than the first step of Salary Grade 10. Barangay tanods, members of '
  'the barangay peacekeeping action team, purok leaders, day care teachers of '
  'the child development center and barangay health workers receive not less '
  'than ₱1,000 a month. Members of the lupong tagapamayapa receive an aggregate '
  'of not more than ₱2,000 a month. Every one of them receives a year-end bonus '
  'of at least ₱1,000. The rates are chargeable to the barangay funds and are '
  'subject to the personal services limitation.',
  'salary sahod honorarium pay allowance how much does a barangay captain kagawad '
  'tanod bhw day care teacher earn bonus')

A('46', 'Number of barangay tanods', 'V',
  'A barangay may have one barangay tanod for every 200 inhabitants, but not '
  'more than 30 tanods in all, appointed by the punong barangay with the '
  'concurrence of the majority of the sangguniang barangay.',
  'how many tanod bantay limit maximum appointed')

A('47', 'Other benefits of barangay officials', 'V',
  'Barangay officials, including barangay tanods and members of the lupong '
  'tagapamayapa, are entitled to insurance coverage, free medical care in '
  'government hospitals and clinics, and a preference in the grant of '
  'scholarships for themselves or a dependent, in addition to their honoraria.',
  'benefits insurance philhealth free hospital scholarship for barangay officials')

A('48', 'Term of barangay officials', 'V',
  'Barangay officials serve a term of three years, and no barangay official may '
  'serve for more than three consecutive terms in the same position. Voluntary '
  'renunciation of the office for any length of time is not an interruption of '
  'the continuity of service for the full term for which the official was '
  'elected.',
  'how long term limit three terms reelection barangay captain kagawad')

# ---------------------------------------- katarungang pambarangay ----
A('50', 'The lupong tagapamayapa in every barangay', 'VI',
  'Every barangay has a lupong tagapamayapa, composed of the punong barangay as '
  'chairperson and not less than 10 and not more than 20 members. The lupon is '
  'constituted every three years. This is the katarungang pambarangay — the '
  'barangay justice system that settles disputes between neighbours without '
  'going to court.',
  'katarungang pambarangay lupon barangay justice settle dispute reklamo away '
  'how many members')

A('51', 'Who may be a member of the lupon', 'VI',
  'Any person who actually resides or works in the barangay, is not expressly '
  'disqualified by law, and is of good standing — known for integrity, '
  'impartiality, independence of mind, a sense of fairness and a reputation for '
  'probity — may be appointed a member of the lupon.',
  'who can be a lupon member qualifications residence requirement')

A('52', 'How the lupon is constituted', 'VI',
  'The punong barangay prepares a notice naming the proposed members and posts '
  'it in three conspicuous places in the barangay for at least three weeks. '
  'After the posting and after considering any opposition or recommendation, '
  'the punong barangay appoints the members with the concurrence of the '
  'majority of the sangguniang barangay, and the appointees take their oath. '
  'The list of members is posted in the barangay hall.',
  'how is the lupon formed appointed posting three weeks notice oath')

A('53', 'Term of lupon members', 'VI',
  'A lupon member holds office for three years from the taking of the oath, or '
  'until a successor is appointed and qualified.',
  'how long lupon member term three years')

A('56', 'The pangkat ng tagapagkasundo', 'VI',
  'Where mediation by the punong barangay fails, a conciliation panel called the '
  'pangkat ng tagapagkasundo is constituted from the lupon. It has three '
  'members chosen by the parties from the lupon; if the parties cannot agree, '
  'the punong barangay draws them by lot. The pangkat elects its own '
  'chairperson and secretary.',
  'pangkat conciliation panel three members how chosen lot')

A('60', 'Subject matter for settlement', 'VI',
  'All disputes between persons actually residing in the same city or '
  'municipality must first be brought for amicable settlement before the lupon, '
  'and no complaint involving such a dispute may be filed or accepted directly '
  'in court or any government office without a certification that the '
  'settlement has been attempted and has failed.',
  'do i need to go to the barangay first before filing a case court certificate to '
  'file action')

A('61', 'Disputes the lupon may not settle', 'VI',
  'The lupon has no authority over: a dispute where one party is the government '
  'or a public officer sued in that capacity; an offence punishable by '
  'imprisonment of more than one year or a fine of more than ₱5,000; an offence '
  'with no private offended party; a dispute where the parties reside in '
  'different cities or municipalities, unless they agree to submit to the lupon; '
  'real property located in different cities or municipalities; a labour '
  'dispute; a dispute arising from the Comprehensive Agrarian Reform Law; and a '
  'case where urgent legal action is needed to prevent injustice, such as an '
  'application for a temporary restraining order or support pendente lite. Any '
  'party may go directly to court in these cases.',
  'exceptions when can i go straight to court skip the barangay not covered')

A('62', 'Where the dispute is brought', 'VI',
  'A dispute between residents of the same barangay is brought before the lupon '
  'of that barangay. A dispute between residents of different barangays in the '
  'same city or municipality is brought before the lupon of the barangay where '
  'the respondent, or any of the respondents, actually resides, at the '
  'complainant’s election. A dispute over real property is brought before the '
  'lupon of the barangay where the property is located. A dispute arising at a '
  'workplace or an institution is brought before the lupon of the barangay where '
  'it is located.',
  'which barangay do i file in venue where to complain different barangay')

A('63', 'How a complaint is brought', 'VI',
  'The complaint is made orally or in writing to the lupon chairperson, who '
  'within the next working day summons the respondent and the complainant, with '
  'their witnesses, to appear before him for mediation.',
  'how to file a complaint reklamo summon next working day')

A('64', 'Mediation by the punong barangay', 'VI',
  'The punong barangay has 15 days from the first meeting of the parties to '
  'bring about a settlement. If mediation fails within that period, the pangkat '
  'ng tagapagkasundo is constituted.',
  'how long does mediation take 15 days punong barangay fails')

A('65', 'Conciliation by the pangkat', 'VI',
  'The pangkat convenes not later than three days after its constitution, on '
  'the day agreed on by the parties. It has 15 days from that first meeting to '
  'arrive at a settlement, extendible for another 15 days for a clear and '
  'compelling reason, and no further.',
  'how long pangkat 15 days extension conciliation hearing')

A('66', 'Appearance of parties in person', 'VI',
  'In all katarungang pambarangay proceedings the parties must appear in person '
  'without the assistance of counsel or representative, except for a minor or an '
  'incompetent, who may be assisted by a next of kin who is not a lawyer.',
  'can i bring a lawyer abogado attorney representative barangay hearing')

A('69', 'Form of the settlement or award', 'VI',
  'The amicable settlement or the arbitration award is in writing, in a language '
  'or dialect known to the parties, signed by them and attested by the lupon '
  'chairperson or the pangkat chairperson.',
  'kasunduan written agreement settlement signed language')

A('70', 'Effect of an amicable settlement', 'VI',
  'An amicable settlement or an arbitration award has, after the 10 days for '
  'repudiation, the force and effect of a final judgment of a court, unless it '
  'is repudiated or a petition to nullify it is filed.',
  'is the kasunduan binding final can it be enforced like a court decision')

A('71', 'Repudiation of a settlement', 'VI',
  'A party may repudiate a settlement within 10 days of it, by a sworn statement '
  'filed with the lupon chairperson stating that consent was vitiated by fraud, '
  'violence or intimidation. Repudiation is sufficient basis for the issuance of '
  'a certification to file an action.',
  'cancel back out of a kasunduan 10 days repudiate fraud forced signed')

A('72', 'Execution of a settlement', 'VI',
  'The settlement or award may be enforced by execution by the lupon within six '
  'months of the date of the settlement. After that period it is enforced by '
  'filing an action in the appropriate city or municipal trial court.',
  'enforce implement the kasunduan not followed six months execution court')

A('74', 'Suspension of the running of prescription', 'VI',
  'While a dispute is before the lupon, the prescriptive periods for offences '
  'and causes of action are interrupted from the filing of the complaint with '
  'the punong barangay, and resume on receipt of the certificate of repudiation '
  'or the certification to file an action — but the interruption may not exceed '
  '60 days from the filing.',
  'prescription deadline to file case interrupted 60 days time limit expired')

A('76', 'Legal advice and the barangay legal aid', 'VI',
  'No lupon or pangkat member may appear as counsel for a party in any '
  'proceeding before the lupon, or in a case arising from a dispute he handled. '
  'The Ministry of the Interior and Local Government and the Integrated Bar may '
  'provide the lupon with legal advice and training.',
  'conflict of interest lupon member lawyer training legal advice')

A('78', 'Legal fees and the katarungang pambarangay fund', 'VI',
  'Katarungang pambarangay proceedings are free — no filing fee is charged for a '
  'complaint. The sangguniang barangay appropriates funds for the operation of '
  'the lupon, including the honoraria of its members and the supplies and forms '
  'it uses.',
  'how much does it cost to file at the barangay free bayad fee')

# ------------------------------------------- sangguniang kabataan ----
A('80', 'The katipunan ng kabataan', 'VII',
  'The katipunan ng kabataan is composed of all citizens of the Philippines '
  'actually residing in the barangay for at least six months who are 15 to 30 '
  'years old and are registered in the list kept by the Commission on Elections '
  'or in the katipunan ng kabataan book of members.',
  'kk youth who is a member age 15 to 30 sk')

A('81', 'The sangguniang kabataan', 'VII',
  'The sangguniang kabataan is composed of an SK chairperson and seven SK '
  'members elected by the katipunan ng kabataan. It has an SK secretary and an '
  'SK treasurer appointed by the chairperson with the concurrence of a majority '
  'of the SK members.',
  'sk composition how many members seven chairman youth council')

A('83', 'Qualifications of an SK official', 'VII',
  'An elective SK official must be a Filipino citizen, a qualified voter of the '
  'katipunan ng kabataan, a resident of the barangay for at least one year '
  'immediately before the election, at least 18 and not more than 24 years old '
  'on election day, able to read and write, not related within the second civil '
  'degree of consanguinity or affinity to any incumbent elected national, '
  'regional or local official, and must not have been convicted by final '
  'judgment of an offence involving moral turpitude.',
  'sk chairman chairperson age requirement qualifications who can run 18 24 relative')

A('86', 'Term of SK officials', 'VII',
  'SK officials serve a term of three years and may not serve for more than '
  'three consecutive terms in the same position.',
  'sk term how long three years limit')

A('92', 'Powers and functions of the sangguniang kabataan', 'VII',
  'The sangguniang kabataan promulgates resolutions necessary to carry out the '
  'purposes of the katipunan ng kabataan, initiates programs for the youth of '
  'the barangay, holds fund-raising activities whose proceeds accrue to the SK '
  'general fund, creates bodies as the youth development plan requires, and '
  'submits an annual report to the sangguniang barangay.',
  'what does the sk do functions powers youth programs')

A('96', 'Funds of the sangguniang kabataan', 'VII',
  'Ten per cent of the general fund of the barangay is set aside for the '
  'sangguniang kabataan. Not more than 25 per cent of the SK funds may go to '
  'honoraria and other personnel benefits, and not more than 15 per cent to '
  'capacity-building and training. The funds are disbursed on an approved annual '
  'barangay youth investment program.',
  'sk budget pondo how much 10 percent of the barangay funds honoraria limit')

A('99', 'Mandatory training of SK officials', 'VII',
  'Every SK official must complete an eight-hour onboarding orientation within '
  'three months of assuming office, and at least 32 hours of continuing training '
  'on local governance, financial management and youth development over the '
  'term. Failure without justifiable cause is a ground for administrative '
  'action.',
  'sk training required mandatory orientation hours 8 32')

A('104', 'The pederasyon ng mga sangguniang kabataan', 'VII',
  'The SK chairpersons of a municipality or city form a pederasyon presided over '
  'by an elected president, who sits as an ex officio member of the sangguniang '
  'bayan or sangguniang panlungsod. The presidents in a province form the '
  'provincial pederasyon, whose president sits as an ex officio member of the '
  'sangguniang panlalawigan.',
  'sk federation pederasyon president ex officio member sanggunian')

# ------------------------- creating a municipality, a city, a province ----
A('109', 'Requirements for creating a municipality', 'VIII',
  'A municipality may be created where the territory has an average annual '
  'income of at least ₱2,500,000 for the last two consecutive years certified by '
  'the Ministry of Finance, Budget and Management, a population of at least '
  '25,000 certified by the Philippine Statistics Authority, and a contiguous '
  'territory of at least 50 square kilometers certified by the Land Management '
  'Bureau. The income requirement must be based on constant prices of the '
  'preceding two years.',
  'how to create a new municipality town requirements income population land area')

A('110', 'Site requirement for a new municipality', 'VIII',
  'The creation of a municipality requires a donated site of at least 15,000 '
  'square meters for the municipal hall and its public facilities, including at '
  'least 5,000 square meters each for a public market, a public plaza, a school '
  'site and a public cemetery, covered by a deed of donation and a certificate '
  'of title.',
  'land needed for a new town site municipal hall market plaza cemetery square meters')

A('111', 'Municipalities in indigenous and tribal areas', 'VIII',
  'A municipality in an area of indigenous cultural communities or tribal '
  'peoples may be created on a population of at least 20,000, instead of the '
  '25,000 otherwise required.',
  'tribal municipality indigenous smaller population 20000 exemption')

A('112', 'Procedure for creating a municipality', 'VIII',
  'The petition is filed with the Bangsamoro Parliament through the Ministry of '
  'the Interior and Local Government, with the certifications on income, '
  'population and territory attached. A municipality is created only by an Act '
  'of the Bangsamoro Parliament and only after a majority vote in a plebiscite '
  'in the political units directly affected.',
  'who creates a municipality parliament act petition plebiscite process')

A('118', 'Powers and functions of a municipality', 'IX',
  'A municipality delivers extension and on-site research services for '
  'agriculture and fishery; a municipal health office and primary health care, '
  'maternal and child care, and the purchase of medicines and medical supplies; '
  'social welfare services including programs for children, the elderly and '
  'persons with disability; information services; solid waste disposal and '
  'environmental management; municipal buildings, roads and bridges, school '
  'buildings, health centers, water supply systems, communal irrigation, '
  'artesian wells, the public market, a slaughterhouse and a public cemetery; '
  'public parks and a sports center; tourism facilities; and sites for police '
  'and fire stations and a municipal jail.',
  'what does a municipality town do services functions responsibilities mayor')

A('125', 'Requirements for converting into a city', 'X',
  'A municipality or a cluster of barangays may be converted into a component '
  'city where it has an average annual income of at least ₱100,000,000 for the '
  'last two consecutive years based on constant prices, and either a contiguous '
  'territory of at least 100 square kilometers or a population of at least '
  '150,000, certified by the ministries and agencies concerned. The territorial '
  'requirement need not be contiguous where it comprises two or more islands.',
  'how to become a city conversion requirements income population cityhood')

A('134', 'Requirements for creating a province', 'XII',
  'A province may be created where it has an average annual income of at least '
  '₱200,000,000 for the last two consecutive years based on constant prices, and '
  'either a contiguous territory of at least 2,000 square kilometers or a '
  'population of at least 250,000. The territory need not be contiguous where it '
  'comprises two or more islands or is separated by a chartered city.',
  'how to create a new province requirements income land area population')

A('143', 'Powers and functions of a province', 'XIII',
  'A province delivers agricultural extension and on-site research; industrial '
  'research and development; enforcement of forestry laws limited to community-'
  'based forestry projects, pollution control and small-scale mining; provincial '
  'health services including hospitals and tertiary health services; social '
  'welfare services including rebel returnee and evacuee relief; provincial '
  'buildings, roads and bridges, inter-municipal waterworks, drainage and flood '
  'control; programs and projects for low-cost housing; investment support; '
  'upgrading and modernisation of tax information and collection; tourism '
  'development; and the dispersal of livestock and poultry.',
  'what does a province do governor services functions responsibilities')

# ------------------------------------------------- elective officials ----
A('182', 'Qualifications of an elective local official', 'XXIII',
  'An elective local official must be a citizen of the Philippines, a '
  'registered voter in the barangay, municipality, city or province where he '
  'intends to be elected, a resident there for at least one year immediately '
  'before the election, and able to read and write Filipino, Arabic, English or '
  'any local language or dialect. A candidate for governor, vice governor or '
  'member of the sangguniang panlalawigan, or for mayor, vice mayor or member of '
  'the sangguniang panlungsod of a highly urbanised city, must be at least 23 '
  'years old on election day; for mayor or vice mayor of an independent '
  'component city, component city or municipality, at least 21; for member of '
  'the sangguniang panlungsod or sangguniang bayan, at least 18; for punong '
  'barangay or sangguniang barangay member, at least 18.',
  'who can run for mayor governor kagawad age requirement qualifications candidate '
  'residency')

A('183', 'Disqualifications from running for local office', 'XXIII',
  'The following are disqualified from running for any elective local position: '
  'a person sentenced by final judgment for an offence involving moral turpitude '
  'or for an offence punishable by one year or more of imprisonment, within two '
  'years after serving sentence; a person removed from office as a result of an '
  'administrative case; a person convicted by final judgment for violating the '
  'oath of allegiance to the Republic; a dual citizen; a fugitive from justice '
  'in criminal or non-political cases here or abroad; a permanent resident of a '
  'foreign country or one who has acquired the right to reside abroad and '
  'continues to avail of it; and the insane or feeble-minded.',
  'who cannot run disqualified banned convicted removed dual citizen green card')

A('184', 'Relatives within the second civil degree', 'XXIII',
  'No person related within the second civil degree of consanguinity or affinity '
  'to an incumbent elective official of the same local government unit may run '
  'for an elective position in that unit in the same election. A candidate '
  'declares in the certificate of candidacy that he is not so related, and a '
  'false declaration is a ground for the denial or cancellation of the '
  'certificate.',
  'political dynasty relative running same family second degree brother wife son '
  'certificate of candidacy')

A('185', 'Term of office of local officials', 'XXIII',
  'Elective local officials serve a term of three years starting at noon on the '
  '30th day of June following the election, and no such official may serve for '
  'more than three consecutive terms in the same position. Voluntary renunciation '
  'of the office for any length of time is not an interruption of the continuity '
  'of service for the full term for which the official was elected.',
  'how long is a term three years term limit reelection mayor governor when do they '
  'assume office june 30')

A('187', 'Salaries of local officials', 'XXIII',
  'The salary of a local official is fixed by ordinance of the sanggunian '
  'concerned, within the limits of the Salary Standardization Law and the '
  'personal services limitation. A provincial governor is at Salary Grade 30, a '
  'city mayor of a highly urbanised city at Salary Grade 30, a vice governor and '
  'a city vice mayor at Salary Grade 28, a municipal mayor at Salary Grade 27 '
  'and a municipal vice mayor at Salary Grade 25. The punong barangay and the '
  'other barangay officials receive honoraria at the rates fixed in these Rules '
  'and not salaries.',
  'sahod salary of a mayor governor vice mayor how much do they earn salary grade')

A('189', 'Practice of profession by a local official', 'XXIII',
  'A governor, city mayor, municipal mayor, punong barangay, vice governor and '
  'vice mayor may not practice their profession or engage in any occupation '
  'other than the exercise of their functions. A sanggunian member may practice '
  'a profession or engage in an occupation except during session hours, but a '
  'sanggunian member who is also a lawyer may not appear as counsel in a civil '
  'case where the local government unit is the adverse party, in a criminal case '
  'where an officer of the government is accused of an offence committed in '
  'office, or in an administrative proceeding before a government office; nor '
  'may a doctor of medicine be so restricted from rendering free medical service '
  'to the public.',
  'can a mayor practice law private practice business sideline lawyer doctor '
  'sanggunian member')

A('191', 'Permanent vacancy in the office of the local chief executive', 'XXIV',
  'If a governor, city or municipal mayor becomes permanently vacant, the vice '
  'governor or vice mayor concerned becomes the governor or mayor. If the vice '
  'governor or vice mayor also becomes permanently vacant, the highest-ranking '
  'sanggunian member becomes the vice governor or vice mayor, and the second '
  'highest-ranking member succeeds to the office vacated. Ranking is determined '
  'by the proportion of votes obtained by each winning candidate to the total '
  'number of registered voters in each district in the immediately preceding '
  'election.',
  'succession who takes over if the mayor dies resigns vacancy ranking')

A('192', 'Permanent vacancy in the sanggunian', 'XXIV',
  'A permanent vacancy in the sangguniang panlalawigan, panlungsod or bayan is '
  'filled by appointment by the Chief Minister for the sangguniang panlalawigan '
  'and the sangguniang panlungsod of a highly urbanised or independent component '
  'city, and by the governor for the sangguniang panlungsod of a component city '
  'and the sangguniang bayan. The appointee comes from the political party of '
  'the sanggunian member who caused the vacancy, on the nomination of that '
  'party. A permanent vacancy in the sangguniang barangay is filled by '
  'appointment by the city or municipal mayor on the recommendation of the '
  'sangguniang barangay.',
  'replacement appointed to fill a vacant council seat kagawad died resigned party '
  'nomination')

A('193', 'Temporary vacancy in the office of the local chief executive', 'XXIV',
  'When a local chief executive is temporarily incapacitated — by leave of '
  'absence, travel abroad or suspension from office — the vice governor or vice '
  'mayor exercises the powers of the office, except the power to appoint, '
  'suspend or dismiss employees, which may be exercised only if the incapacity '
  'exceeds 30 working days.',
  'acting mayor officer in charge oic when the mayor is away on leave suspended '
  '30 days')

# ----------------------------------------- discipline, appeal, recall ----
A('195', 'Grounds for disciplinary action', 'XXV',
  'An elective local official may be disciplined, suspended or removed for '
  'disloyalty to the Republic; culpable violation of the Constitution or the '
  'Bangsamoro Organic Law; dishonesty, oppression, misconduct in office, gross '
  'negligence or dereliction of duty; commission of an offence involving moral '
  'turpitude or punishable by at least prision mayor; abuse of authority; '
  'unauthorised absence for 15 consecutive working days, except in the case of '
  'a sanggunian member; acquisition of foreign citizenship or residence or the '
  'status of an immigrant of another country; and any other ground provided by '
  'law.',
  'how to remove a mayor complaint case against official grounds misconduct '
  'absent abuse')

A('196', 'Where a complaint is filed', 'XXV',
  'A verified complaint against an elective provincial, highly urbanised city or '
  'independent component city official is filed with the Office of the Chief '
  'Minister; against an elective municipal official, with the sangguniang '
  'panlalawigan; and against an elective barangay official, with the '
  'sangguniang panlungsod or sangguniang bayan concerned, whose decision is '
  'final and executory.',
  'where do i file a complaint against a mayor barangay captain governor which '
  'office')

A('198', 'Preventive suspension', 'XXV',
  'Preventive suspension may be imposed after the issues are joined, when the '
  'evidence of guilt is strong and there is great probability that continuance '
  'in office would influence the witnesses or pose a threat to the records. A '
  'single preventive suspension may not exceed 60 days, and where several '
  'administrative cases are filed against an official he may not be preventively '
  'suspended for more than 90 days within a single year on the same ground '
  'existing and known at the time of the first suspension. The official is '
  'reinstated automatically at the expiry of the period.',
  'preventive suspension how long 60 days 90 days suspended mayor reinstated')

A('199', 'Salary during suspension', 'XXV',
  'An official preventively suspended receives no salary or compensation during '
  'the suspension, but on exoneration and reinstatement is paid the full amount '
  'of the salary and emoluments not received during the suspension.',
  'is a suspended official paid back pay salary during suspension cleared')

A('200', 'Time limit on the investigation', 'XXV',
  'The investigation of an administrative complaint must be terminated within 90 '
  'days of its start, and the office or body conducting it renders a decision in '
  'writing within 30 days after the end of the investigation.',
  'how long does an administrative case take 90 days decision 30 days')

A('201', 'Penalties in administrative cases', 'XXV',
  'The penalty of suspension may not exceed the unexpired term of the official, '
  'and in no case may it exceed six months for a single offence. The penalty of '
  'removal is a bar to the candidacy of the official for any elective position. '
  'An elective official may be removed from office only by order of a proper '
  'court.',
  'penalty for a mayor found guilty suspension six months removal banned from '
  'running')

A('204', 'Appeal from a decision', 'XXV',
  'A decision in an administrative case may be appealed within 30 days of '
  'receipt — to the sangguniang panlalawigan where the decision was rendered by '
  'a sangguniang panlungsod or bayan over a barangay official, and to the Office '
  'of the Chief Minister where it was rendered by a sangguniang panlalawigan or '
  'a sangguniang panlungsod of a highly urbanised or independent component city. '
  'The decision of the Office of the Chief Minister is final and executory.',
  'appeal an administrative decision 30 days where to appeal chief minister')

A('206', 'Appeal fee and form', 'XXV',
  'The appeal is filed in three legible copies with proof of service on the '
  'adverse party, accompanied by an appeal fee of ₱3,000 and a memorandum of '
  'appeal stating the grounds relied on. A decision becomes final and executory '
  '15 days after receipt if no appeal is taken.',
  'appeal fee how much 3000 copies memorandum final 15 days')

A('223', 'Recall of a local official', 'XXVI',
  'An elective local official may be removed from office on the ground of loss '
  'of confidence, by a recall election initiated by the registered voters of the '
  'local government unit concerned. Recall is exercised only once during the '
  'term of office of the official, and no recall may take place within one year '
  'of the official assuming office or within one year immediately preceding a '
  'regular local election.',
  'recall remove an official loss of confidence how often once per term one year')

A('224', 'Petition for recall and the number of signatures required', 'XXVI',
  'The recall petition must be signed by at least 25 per cent of the registered '
  'voters where the unit has up to 20,000 voters; at least 20 per cent where it '
  'has more than 20,000 but not more than 75,000, and in no case fewer than '
  '5,000; at least 15 per cent where it has more than 75,000 but not more than '
  '300,000, and in no case fewer than 15,000; and at least 10 per cent where it '
  'has more than 300,000, and in no case fewer than 45,000.',
  'how many signatures to recall a mayor percentage requirement petition voters')

A('226', 'The recall election', 'XXVI',
  'The Commission on Elections sets the recall election within 30 days of the '
  'certification of the sufficiency of the petition in the case of a barangay, '
  'city or municipal official, and within 45 days in the case of a provincial '
  'official. The official sought to be recalled is automatically a candidate, '
  'and continues in office until a successor is elected and qualified.',
  'when is the recall election held 30 days 45 days is the official a candidate')

A('228', 'Expenses of a recall election', 'XXVI',
  'All expenses of the recall election are borne by the Commission on Elections '
  'and are included in its annual budget; no part of them is charged to the '
  'local government unit concerned.',
  'who pays for a recall election cost comelec budget')

# ----------------------------------------------- appointive officials ----
A('229', 'Mandatory appointive officials of a province', 'XXVII',
  'A province must have a secretary to the sanggunian, a treasurer, an assessor, '
  'an accountant, an engineer, a budget officer, a planning and development '
  'coordinator, a legal officer, an administrator, a health officer, a social '
  'welfare and development officer, a general services officer, an agriculturist '
  'and a veterinarian.',
  'what offices must a province have required officials positions department heads')

A('230', 'Mandatory appointive officials of a city', 'XXVII',
  'A city must have a secretary to the sanggunian, a treasurer, an assessor, an '
  'accountant, an engineer, a budget officer, a planning and development '
  'coordinator, a legal officer, an administrator, a health officer, a social '
  'welfare and development officer, a general services officer, a veterinarian '
  'and an architect.',
  'what offices must a city have required officials positions department heads')

A('231', 'Mandatory appointive officials of a municipality', 'XXVII',
  'A municipality must have a secretary to the sanggunian, a treasurer, an '
  'assessor, an accountant, a budget officer, a planning and development '
  'coordinator, an engineer, a health officer and a civil registrar. A municipal '
  'administrator, a legal officer, an agriculturist, an environment and natural '
  'resources officer, a social welfare and development officer, an architect and '
  'an information officer are optional and may be appointed as the sanggunian '
  'provides.',
  'what offices must a municipality have required optional officials department '
  'heads town hall')

A('233', 'Appointment of department heads', 'XXVII',
  'Heads of departments and offices are appointed by the local chief executive '
  'with the concurrence of the majority of all the sanggunian members, subject '
  'to civil service law, rules and regulations. The sanggunian acts on the '
  'appointment within 15 days of its submission, otherwise the appointment is '
  'deemed confirmed.',
  'who appoints department heads confirmation sanggunian 15 days deemed confirmed')

A('236', 'The local administrator', 'XXVII',
  'The local administrator develops plans and strategies for the management of '
  'the unit, assists in the coordination of the work of all officials, and '
  'recommends measures on personnel administration. The position is mandatory '
  'for a province and a city and optional for a municipality.',
  'what does an administrator do duties mandatory optional')

A('240', 'The local treasurer', 'XXVII',
  'The treasurer takes custody of and is accountable for all local government '
  'funds, takes charge of the disbursement of all funds and such other funds as '
  'may be entrusted by law or ordinance, inspects the books of persons subject '
  'to local taxes, maintains and updates the tax information system, and '
  'certifies to the availability of funds whenever necessary. The treasurer is '
  'appointed by the Minister of Finance, Budget and Management from a list of at '
  'least three ranking eligible recommendees of the local chief executive.',
  'what does the treasurer do duties who appoints the treasurer')

A('243', 'The local assessor', 'XXVII',
  'The assessor ensures that all laws and policies on the appraisal and '
  'assessment of real property are properly executed, installs and maintains a '
  'real property identification and accounting system, prepares and submits an '
  'assessment roll of all real property, and conducts frequent physical surveys '
  'to verify and determine whether all real property is properly listed in the '
  'assessment rolls.',
  'what does the assessor do duties property valuation tax declaration')

A('248', 'The local health officer', 'XXVII',
  'The health officer takes charge of the office on health services, supervises '
  'the personnel and staff of that office, formulates measures and provides '
  'technical assistance on health, and is the local government unit’s health and '
  'sanitation authority. The position is mandatory for a province, a city and a '
  'municipality.',
  'what does the health officer do municipal doctor duties mandatory')

A('256', 'Qualifications and civil service coverage', 'XXVII',
  'Appointive local officials and employees are covered by civil service law, '
  'rules and regulations, and must possess the qualification standards for the '
  'position, including the education, experience, training and eligibility the '
  'Civil Service Commission prescribes.',
  'civil service eligibility requirements for local government job qualification '
  'standards')

A('399', 'Appointments, nepotism and temporary employment', 'XLII',
  'No person may be appointed in the local government service if he is related '
  'within the fourth civil degree of consanguinity or affinity to the appointing '
  'or recommending authority. A temporary appointment to a career position may '
  'not exceed 12 months, and a casual appointment may not exceed six months. All '
  'appointments are submitted to the Civil Service Commission for attestation '
  'within 30 days of issuance, and an appointment not so submitted is '
  'ineffective.',
  'nepotism relative hiring fourth degree temporary casual appointment how long '
  'civil service attestation')

A('406', 'Leave of absence of local officials and employees', 'XLII',
  'Local officials and employees are entitled to 15 days of vacation leave and '
  '15 days of sick leave with full pay for every year of service, cumulative and '
  'commutable. A female employee is entitled to 105 days of maternity leave with '
  'full pay, and a male employee to seven days of paternity leave for the first '
  'four deliveries of his legitimate spouse. Leave of the local chief executive '
  'is approved by the Chief Minister through the Ministry of the Interior and '
  'Local Government.',
  'vacation sick leave how many days maternity paternity who approves the mayor '
  'leave')

# ------------------------------------------ prohibited acts, penalties ----
A('407', 'Prohibited business and pecuniary interest', 'XLIII',
  'A local official or employee may not engage in any business transaction with '
  'the local government unit he serves, or with any of its offices, in which he '
  'is pecuniarily interested; hold an interest in any cockpit or other game '
  'licensed by the unit; purchase any real estate or other property forfeited in '
  'favor of the unit for unpaid taxes at the public auction; be a surety for '
  'any person contracting or doing business with the unit for which a surety is '
  'required; or possess or use any public property for private purposes.',
  'conflict of interest can a mayor do business with the town cockpit auction '
  'surety corruption prohibited')

A('411', 'Penalty for prohibited business and pecuniary interest', 'XLIII',
  'This article sets the penalty for a violation of the prohibition on business '
  'and pecuniary interest at imprisonment of six months and one day to six '
  'years, or a fine of not less than ₱3,000 and not more than ₱10,000, or both '
  'at the discretion of the court. Section 574 of the Code itself sets the fine '
  'for the same violation at not less than ₱40,000 and not more than ₱1,200,000. '
  'The two do not agree, and the Code prevails over its implementing rules, so '
  'the ₱40,000 to ₱1,200,000 range is the one in force.',
  'penalty fine jail for conflict of interest prohibited business how much '
  'multa parusa')

A('415', 'Penalty for other violations of the Code', 'XLIII',
  'Unless otherwise provided, a person who violates a provision of the Code for '
  'which no penalty is specifically fixed is punished by imprisonment of not '
  'less than one month and not more than six months, or a fine of not less than '
  '₱40,000 and not more than ₱1,200,000, or both at the discretion of the court. '
  'Where the offender is a local official or employee, the penalty includes '
  'dismissal from the service with disqualification from holding public office '
  'and forfeiture of retirement benefits.',
  'penalty fine for violating the code how much jail time general penalty multa')

A('404', 'Honoraria in the provisions carried over from national law', 'XLII',
  'This article carries an older schedule of barangay honoraria — not less than '
  '₱1,000 a month for the punong barangay and ₱600 a month for a sangguniang '
  'barangay member. Article 45 of these same Rules, and Section 424 of the Code, '
  'fix the floors at ₱5,000 for the punong barangay and ₱3,000 for the other '
  'officials. The published IRR contradicts itself here; the Article 45 figures '
  'are the ones consistent with the Code and control.',
  'barangay honorarium conflicting rates 1000 600 which is correct contradiction')

# --------------------------------------------- local special bodies ----
A('268', 'The local development council', 'XXX',
  'Every province, city, municipality and barangay has a local development '
  'council that assists the sanggunian in setting the direction of economic and '
  'social development and coordinates development efforts within its territory. '
  'The council is headed by the local chief executive and meets at least once '
  'every six months.',
  'local development council ldc what is it who heads it meetings')

A('269', 'Composition of the local development council', 'XXX',
  'A city or municipal development council is composed of the mayor as '
  'chairperson, all punong barangay of the unit, the chairperson of the '
  'sanggunian committee on appropriations, the member of the House of '
  'Representatives or a representative, and representatives of '
  'non-governmental organizations operating in the unit who constitute not less '
  'than one fourth of the members of the fully organized council.',
  'who sits on the development council ngo representation one fourth composition')

A('271', 'Women in local special bodies', 'XXX',
  'At least 40 per cent of the members of every local special body — the '
  'development council, the school board, the health board, the peace and order '
  'council and the disaster risk reduction and management council — must be '
  'women, and the local chief executive ensures the representation of indigenous '
  'peoples, youth and persons with disability in them.',
  'women representation quota 40 percent gender in councils boards')

A('280', 'The local school board', 'XXX',
  'A provincial, city or municipal school board is co-chaired by the local chief '
  'executive and the schools division superintendent, with the chairperson of '
  'the sanggunian committee on education, the treasurer, the representative of '
  'the pederasyon ng mga sangguniang kabataan, the duly elected president of the '
  'federation of parent-teacher associations, the duly elected representative of '
  'the teachers’ organizations and the duly elected representative of the '
  'non-academic personnel as members.',
  'school board composition who sits deped superintendent pta teachers')

A('282', 'The special education fund', 'XXX',
  'The local school board determines the annual supplementary budget for the '
  'operation and maintenance of public schools out of the proceeds of the '
  'additional one per cent tax on real property constituting the Special '
  'Education Fund. The fund may be spent on the construction and repair of '
  'school buildings, educational research, the purchase of books and periodicals '
  'and sports development.',
  'sef special education fund what can it be spent on 1 percent real property tax')

A('286', 'The local health board', 'XXX',
  'A provincial, city or municipal health board is chaired by the local chief '
  'executive with the health officer as vice chairperson, and includes the '
  'chairperson of the sanggunian committee on health, a representative of the '
  'Ministry of Health and a representative of a non-governmental organization '
  'involved in health services. It proposes the annual budgetary allocations for '
  'the operation and maintenance of health facilities and services.',
  'health board composition who sits budget for health facilities')

A('292', 'The local peace and order council', 'XXX',
  'Every province, city and municipality has a peace and order council chaired '
  'by the local chief executive, which formulates plans and recommends measures '
  'to improve or enhance peace and order and public safety, monitors the '
  'implementation of peace and order programs, and makes periodic assessments '
  'of the prevailing peace and order situation.',
  'peace and order council popc what does it do composition')

A('298', 'The local disaster risk reduction and management council', 'XXX',
  'Every province, city and municipality has a disaster risk reduction and '
  'management council chaired by the local chief executive, and every barangay '
  'has a barangay disaster risk reduction and management committee chaired by '
  'the punong barangay. The council approves the local disaster risk reduction '
  'and management plan and administers the local disaster risk reduction and '
  'management fund.',
  'ldrrmc bdrrmc disaster council calamity who chairs plan fund')

A('305', 'People’s and non-governmental organizations', 'XXX',
  'Local government units promote the establishment and operation of people’s '
  'organizations, non-governmental organizations and the private sector, and may '
  'enter into joint ventures and cooperative arrangements with them to deliver '
  'basic services, build capacity and improve the delivery of local facilities. '
  'A local government unit may extend financial or other forms of assistance to '
  'such organizations for economic, socially oriented and environmental '
  'projects.',
  'ngo po civil society partnership joint venture assistance accreditation')

# -------------------------------- land, roads, boundaries, devolution ----
A('363', 'Naming of local government units and public places', 'XXXVIII',
  'The sanggunian may change the name of a barangay, a public place, a street, a '
  'structure or a local institution, subject to a plebiscite where a local '
  'government unit is renamed. No change of name may be made more than once '
  'every 10 years, and no public place, street or structure may be named after a '
  'living person.',
  'rename a barangay street can you name something after a living person how often '
  '10 years')

A('367', 'Devolution of basic services', 'XXXIX',
  'The Bangsamoro Government devolves to local government units the '
  'responsibility for the delivery of the basic services and facilities '
  'enumerated in these Rules, together with the personnel, assets, equipment and '
  'records pertaining to them, over a transition period of five years.',
  'devolution transfer of services how long five years personnel assets')

A('372', 'Full devolution status', 'XXXIX',
  'The Islamic City of Marawi, the City of Cotabato and the Province of Basilan '
  'are recognized as having attained full devolution status, and the Ministry of '
  'the Interior and Local Government monitors and certifies the devolution '
  'status of the other local government units.',
  'which lgus are fully devolved marawi cotabato city basilan status')

A('378', 'Eminent domain by a local government unit', 'XL',
  'A local government unit may, through its chief executive and acting under an '
  'ordinance, exercise the power of eminent domain for a public use, purpose or '
  'welfare, particularly for the benefit of the poor and the landless, on '
  'payment of just compensation, and only after a valid and definite offer has '
  'been made to the owner and was not accepted. The unit may immediately take '
  'possession of the property on the filing of the expropriation proceedings and '
  'on making a deposit with the proper court of at least 15 per cent of the fair '
  'market value of the property based on the current tax declaration.',
  'expropriation can the government take my land eminent domain deposit 15 percent '
  'just compensation')

A('384', 'Reclassification of agricultural land', 'XL',
  'A city or municipality may, through an ordinance passed after public '
  'hearings, reclassify agricultural land not devoted to or no longer economically '
  'feasible for agricultural purposes, or where the land will have a greater '
  'economic value for a residential, commercial or industrial purpose. The '
  'reclassification may not exceed 15 per cent of the total agricultural land '
  'area at the time of the passage of the ordinance for a highly urbanised or '
  'independent component city, 10 per cent for a component city or a first to '
  'third class municipality, and 5 per cent for a fourth to sixth class '
  'municipality.',
  'reclassify farm land to residential commercial conversion limit percentage '
  'ordinance')

A('386', 'Land reclassified from agricultural use is not exempt from CARP', 'XL',
  'Reclassification of agricultural land does not exempt it from the coverage of '
  'the Comprehensive Agrarian Reform Program, and land already distributed to '
  'agrarian reform beneficiaries may not be reclassified.',
  'carp agrarian reform can reclassified land be exempt beneficiaries')

A('389', 'Closure and opening of roads', 'XL',
  'A local government unit may permanently or temporarily close or open any '
  'local road, alley, park or square within its jurisdiction by an ordinance '
  'approved by at least two thirds of all the members of the sanggunian, and '
  'after the adequate provision of a substitute for the road being closed. A '
  'permanent closure requires that notice be posted for at least three weeks '
  'and, where the closure is for a purpose other than the public interest, a '
  'public hearing.',
  'close a road street permanently two thirds vote posting three weeks')

A('390', 'Temporary closure for a fiesta or an activity', 'XL',
  'A local road may be temporarily closed for an actual emergency, a fiesta '
  'celebration, a public rally, an agricultural or industrial fair or an '
  'undertaking of a national or local public works project. A closure for a '
  'fiesta celebration may not exceed nine days, and no national or local road '
  'may be temporarily closed for an athletic, cultural or civic activity that is '
  'not officially sponsored, recognized or approved by the local government unit.',
  'close the street for a fiesta how many days nine basketball court activity')

A('392', 'Settlement of boundary disputes', 'XLI',
  'A boundary dispute between two or more barangays in the same city or '
  'municipality is referred for settlement to the sangguniang panlungsod or '
  'bayan concerned; between two or more municipalities in the same province, to '
  'the sangguniang panlalawigan; between municipalities or component cities of '
  'different provinces, jointly to the sanggunians of the provinces concerned; '
  'and between a component city or municipality and a highly urbanised city, or '
  'between two highly urbanised cities, jointly to the respective sanggunians.',
  'boundary dispute between barangays towns who settles it jurisdiction')

A('393', 'Time to settle a boundary dispute and to appeal', 'XLI',
  'The sanggunian concerned settles the boundary dispute amicably within 60 days '
  'of the referral. Where it fails, the dispute is formally tried by the '
  'sanggunian, which issues a decision within 60 days of the trial. An aggrieved '
  'party may appeal the decision to the proper Regional Trial Court within one '
  'year of the decision becoming final and executory.',
  'how long to settle a boundary dispute 60 days appeal court one year')

# ---------------------------------------------------- local taxation ----
A('430', 'Fundamental principles of local taxation', 'XLVI',
  'Local taxation is uniform in each local government unit; is equitable and '
  'based as far as practicable on the taxpayer’s ability to pay; is levied and '
  'collected only for a public purpose; is not unjust, excessive, oppressive or '
  'confiscatory; is not contrary to law, public policy, national economic policy '
  'or in restraint of trade; and the revenue collected accrues solely to the '
  'local government unit levying the tax.',
  'principles of local tax rules fair uniform ability to pay')

A('432', 'Procedure for enacting a tax ordinance', 'XLVI',
  'No tax ordinance or revenue measure may be enacted without a prior public '
  'hearing conducted for the purpose. Within 10 days of approval, the ordinance '
  'is published in full for three consecutive days in a newspaper of local '
  'circulation, or, where there is none, posted in at least two conspicuous and '
  'publicly accessible places.',
  'public hearing required tax ordinance publication posting 10 days three days')

A('434', 'Authority to adjust tax rates', 'XLVI',
  'A local government unit may adjust its tax rates as prescribed in these '
  'Rules, but the adjustment may not be oftener than once every five years and '
  'in no case may the adjustment exceed 10 per cent of the rates fixed.',
  'can the town raise taxes how often five years 10 percent increase limit')

A('437', 'Provincial tax on the transfer of real property', 'XLVII',
  'A province may levy a tax on the sale, donation, barter or any other mode of '
  'transferring ownership or title to real property at not more than one half of '
  'one per cent of the total consideration or of the fair market value, '
  'whichever is higher. The seller or transferor pays it within 60 days of the '
  'execution of the deed or of the death of the decedent.',
  'transfer tax on selling land how much half of one percent 60 days who pays')

A('439', 'Municipal tax on businesses', 'XLVIII',
  'A municipality may impose a graduated tax on businesses. On manufacturers, '
  'assemblers and processors the tax runs from ₱165 a year on gross sales of '
  'less than ₱10,000 up to ₱24,375 on gross sales of ₱5,000,000 to ₱6,499,999, '
  'and on ₱6,500,000 or more a rate of not exceeding 37½ per cent of one per '
  'cent. On retailers the rate is two per cent on gross sales of ₱400,000 or '
  'less and one per cent on the excess above ₱400,000; where a barangay already '
  'levies the tax on a retailer with gross sales of ₱50,000 or less, the '
  'municipality may not. On contractors the tax runs from ₱27.50 a year up to a '
  'rate of not exceeding 50 per cent of one per cent on gross receipts of '
  '₱2,000,000 or more. On banks and other financial institutions the rate is not '
  'exceeding 50 per cent of one per cent of gross receipts.',
  'business tax how much does a store pay permit retailer manufacturer contractor '
  'gross sales rate')

A('441', 'Situs of the tax on business', 'XLVIII',
  'Where a business maintains a branch or sales outlet, the tax is paid to the '
  'municipality where the branch or outlet is located. Where there is no branch '
  'or outlet, the sale is recorded in the principal office and the tax accrues '
  'there. Where a manufacturer has a factory, project office, plant or plantation '
  'in another locality, 30 per cent of all sales recorded in the principal office '
  'is taxable where the principal office is located and 70 per cent where the '
  'factory, plant or plantation is located.',
  'which town do i pay business tax to branch factory 30 70 split situs')

A('444', 'Payment of business taxes', 'XLVIII',
  'Business taxes are payable for every separate or distinct establishment or '
  'place where the business is conducted, and one line of business does not '
  'become exempt by being conducted with some other business for which the tax '
  'has been paid. The tax is payable within the first 20 days of January or of '
  'each subsequent quarter, and the sanggunian may grant a surcharge-free '
  'extension of not more than six months for a justifiable reason.',
  'when to pay business tax deadline january 20 quarterly extension')

A('447', 'The professional tax', 'XLVIII',
  'A province may levy an annual professional tax on each person engaged in the '
  'exercise of a profession requiring government examination at a rate the '
  'sanggunian determines, not exceeding ₱1,300. The tax is payable on or before '
  'the 31st of January, or before beginning to practice, to the province where '
  'the professional practices or maintains a principal office. A professional '
  'who has paid it is entitled to practice anywhere in the country without being '
  'subject to any other national or local tax for that practice.',
  'professional tax ptr how much lawyer doctor engineer nurse 1300 when to pay')

A('448', 'The amusement tax', 'XLVIII',
  'A province may levy an amusement tax on the proprietors, lessees or operators '
  'of theatres, cinemas, concert halls, circuses, boxing stadia and other places '
  'of amusement at a rate of not more than 10 per cent of the gross receipts '
  'from admission fees. The tax is shared equally by the province and the '
  'municipality where the place of amusement is located. Holding of operas, '
  'concerts, dramas, recitals, painting and art exhibitions, flower shows, '
  'musical programs and literary and oratorical presentations is exempt.',
  'amusement tax cinema movie theatre boxing how much 10 percent exempt')

A('449', 'Annual fixed tax on delivery trucks and vans', 'XLVIII',
  'A province may levy an annual fixed tax of not more than ₱2,200 on every '
  'truck, van or vehicle used by a manufacturer, producer, wholesaler, dealer or '
  'retailer in the delivery or distribution of distilled spirits, fermented '
  'liquors, soft drinks, cigars and cigarettes and other products to sales '
  'outlets or consumers within the province. A municipality may levy the same '
  'tax at not more than ₱6,600 where the province does not.',
  'delivery truck van tax how much 2200 6600 distributor')

A('452', 'The community tax', 'XLIX',
  'A city or municipality may levy a community tax. An individual 18 years or '
  'over who is regularly employed on a wage or salary basis for at least 30 '
  'consecutive working days during any calendar year, or who is engaged in '
  'business or occupation, or who owns real property with an aggregate assessed '
  'value of ₱1,000 or more, or who is required by law to file an income tax '
  'return, pays an annual community tax of ₱20 plus ₱1 for every ₱1,000 of '
  'income regardless of whether from business, exercise of profession or '
  'property, but the additional tax may not exceed ₱5,000. A corporation pays '
  '₱1,000 plus an additional tax not exceeding ₱10,000 computed on its assessed '
  'property and gross receipts.',
  'cedula community tax certificate how much does it cost 20 pesos where to get '
  'sedula')

A('454', 'When the community tax is paid', 'XLIX',
  'The community tax accrues on the first day of January of each year and is '
  'paid not later than the last day of February. A person who reaches 18 or '
  'otherwise becomes liable on or before the last day of June pays it within 20 '
  'days of that date; a person who becomes liable after the 30th of June is not '
  'liable for that year. An unpaid community tax bears interest of 24 per cent a '
  'year from the due date until it is paid.',
  'cedula deadline when to pay community tax february interest penalty late')

A('455', 'Exemption from the community tax', 'XLIX',
  'Diplomatic and consular representatives, and transient visitors whose stay in '
  'the Philippines does not exceed three months, are exempt from the community '
  'tax.',
  'who is exempt from cedula community tax diplomat tourist')

A('457', 'Barangay taxes and fees', 'XLIX',
  'A barangay may levy a tax on stores or retailers with fixed business '
  'establishments whose gross sales for the preceding calendar year do not '
  'exceed ₱50,000 in a city or ₱30,000 in a municipality, at a rate of not more '
  'than one per cent of gross sales; service fees or charges for the use of '
  'barangay-owned properties or service facilities; a barangay clearance fee; and '
  'reasonable fees on commercial breeding of fighting cocks, cockfights and '
  'cockpits, places of recreation charging admission fees, and billboards and '
  'other outdoor advertisements.',
  'what taxes can a barangay collect sari sari store tax barangay clearance fee '
  'how much')

A('459', 'Surcharge and interest on unpaid local taxes', 'XLIX',
  'The sanggunian may impose a surcharge of not more than 25 per cent of the '
  'amount of a tax, fee or charge not paid on time, plus interest of not more '
  'than two per cent a month on the unpaid amount including the surcharge, until '
  'it is fully paid — but in no case may the total interest exceed 36 months.',
  'penalty for late payment of local tax surcharge interest 25 percent how much '
  'maximum')

# ------------------------------------------------ real property tax ----
A('505', 'Declaration of real property by the owner', 'LIII',
  'A person acquiring real property, or making an improvement on it, files with '
  'the assessor a sworn statement declaring its true value within 60 days of the '
  'acquisition or of the completion or occupancy of the improvement. Every owner '
  'also files a sworn statement of the value of the property once every three '
  'years, during the period from the first day of January to the 30th of June.',
  'tax declaration how to declare property 60 days sworn statement every three '
  'years')

A('512', 'Classes of real property for assessment', 'LIII',
  'Real property is classified for assessment purposes as residential, '
  'agricultural, commercial, industrial, mineral, timberland or special. Special '
  'classes are lands, buildings and other improvements actually, directly and '
  'exclusively used for hospitals, cultural or scientific purposes, and those '
  'owned and used by local water districts and government-owned or controlled '
  'corporations rendering essential public services in the supply and '
  'distribution of water and generation and transmission of electric power.',
  'classification of land residential agricultural commercial industrial special '
  'class')

A('515', 'Assessment levels', 'LIII',
  'The assessment level is fixed by ordinance and may not exceed: for land, 20 '
  'per cent residential, 40 per cent agricultural, 50 per cent commercial, '
  'industrial and mineral, and 20 per cent timberland. For a residential '
  'building the level runs from nil where the fair market value does not exceed '
  '₱175,000 up to 60 per cent where it exceeds ₱10,000,000; for an agricultural '
  'building from 25 to 50 per cent; and for a commercial or industrial building '
  'from 30 to 80 per cent. Machinery is assessed at 50 per cent for residential, '
  '40 per cent for agricultural and 80 per cent for commercial and industrial '
  'use. Special classes are assessed at 15 per cent for cultural, scientific and '
  'hospital property and 10 per cent for local water districts and government-'
  'owned corporations supplying water and power.',
  'assessment level how is my property assessed percentage residential '
  'agricultural commercial machinery')

A('517', 'General revision of assessments', 'LIII',
  'The assessor undertakes a general revision of real property assessments and '
  'property classification once every three years, and the schedule of fair '
  'market values is prepared by the assessor and enacted by ordinance of the '
  'sanggunian before the general revision takes effect.',
  'revaluation reassessment how often three years schedule of market values')

A('530', 'Rates of the basic real property tax', 'LIV',
  'A province may levy an annual ad valorem tax on real property at a rate not '
  'exceeding one per cent of the assessed value, and a city or a municipality '
  'within the Metropolitan Manila Area at a rate not exceeding two per cent.',
  'amilyar real property tax rate how much 1 percent 2 percent province city')

A('531', 'The additional levy for the Special Education Fund', 'LIV',
  'A province, city or municipality may levy an additional one per cent on the '
  'assessed value of real property, the proceeds of which accrue exclusively to '
  'the Special Education Fund.',
  'sef additional 1 percent real property tax education fund amilyar')

A('532', 'The additional ad valorem tax on idle lands', 'LIV',
  'A province, city or municipality may levy an annual tax on idle lands at a '
  'rate not exceeding five per cent of the assessed value, in addition to the '
  'basic real property tax.',
  'idle land tax vacant lot unused 5 percent')

A('533', 'What counts as idle land', 'LIV',
  'Agricultural land of more than one hectare, half of which remains uncultivated '
  'or unimproved, is idle land; land planted to permanent or perennial crops with '
  'at least 50 trees to a hectare, and land actually used for grazing, are not. '
  'Land other than agricultural of more than 1,000 square meters, half of which '
  'remains unutilized or unimproved, is idle land, as is a residential lot in a '
  'subdivision regardless of area.',
  'what is idle land definition hectare 1000 square meters subdivision lot')

A('535', 'The special levy on lands benefited by a public work', 'LIV',
  'A local government unit may impose a special levy on the lands specially '
  'benefited by a public works project or improvement it funded, at not more '
  'than 60 per cent of the actual cost of the project including the cost of '
  'acquiring the land. The levy does not apply to lands exempt from the basic '
  'real property tax or to the remainder of land portions of which were donated '
  'to the unit for the project.',
  'special assessment levy road drainage project who pays 60 percent benefited')

A('540', 'When the real property tax accrues and how it is paid', 'LIV',
  'The real property tax accrues on the first day of January of each year and '
  'from that date constitutes a lien on the property superior to any other lien '
  'or encumbrance. It may be paid in full on or before the 31st of March, or in '
  'four equal instalments due on or before the 31st of March, the 30th of June, '
  'the 30th of September and the 31st of December.',
  'amilyar deadline when to pay real property tax installment quarterly march 31')

A('541', 'Discount for advance and prompt payment', 'LIV',
  'The sanggunian may grant a discount of not more than 20 per cent of the '
  'annual tax due where the basic real property tax and the additional Special '
  'Education Fund tax are paid in advance or promptly in accordance with the '
  'schedule it prescribes.',
  'discount for early payment of amilyar how much 20 percent advance')

A('543', 'Interest on unpaid real property tax', 'LIV',
  'Failure to pay the real property tax or any other tax on real property on '
  'time subjects the taxpayer to interest of two per cent a month on the unpaid '
  'amount until it is paid, but the total interest may not exceed 36 months.',
  'penalty for late amilyar interest 2 percent per month maximum 36 months')

A('546', 'Distribution of the proceeds of the basic real property tax', 'LIV',
  'The proceeds of the basic real property tax collected by a province are '
  'shared 35 per cent to the province, 40 per cent to the municipality where the '
  'property is located and 25 per cent to the barangay where it is located. '
  'Where a city collects, the share is 70 per cent to the city and 30 per cent '
  'divided among the component barangays, of which the barangay where the '
  'property is located gets one half and the rest is shared equally by all the '
  'other barangays.',
  'where does amilyar go how is real property tax shared barangay share '
  'percentage')

A('549', 'Exemptions from the real property tax', 'LIV',
  'Real property owned by the Republic of the Philippines or any of its '
  'political subdivisions, except where the beneficial use has been granted to a '
  'taxable person; charitable institutions, churches, parsonages or convents, '
  'mosques, non-profit or religious cemeteries and all lands, buildings and '
  'improvements actually, directly and exclusively used for religious, '
  'charitable or educational purposes; machinery and equipment actually, '
  'directly and exclusively used by local water districts and government-owned '
  'corporations supplying water and electric power; real property owned by a duly '
  'registered cooperative; and machinery and equipment used for pollution '
  'control and environmental protection, are exempt from the real property tax.',
  'who does not pay amilyar exempt church mosque school cooperative government '
  'property')

# ------------------------------------------- the local budget process ----
A('610', 'The local budget calendar', 'LX',
  'On or before the 15th of July of each year, the local treasurer submits to '
  'the local chief executive a certified statement covering the income and '
  'expenditures of the preceding fiscal year, the actual income and expenditures '
  'of the first two quarters of the current year, and the estimated income and '
  'expenditures for the last two quarters. Heads of departments and offices '
  'submit their budget proposals by the same date. The local chief executive '
  'submits the executive budget to the sanggunian on or before the 16th of '
  'October.',
  'budget calendar deadlines july 15 october 16 when is the budget prepared')

A('613', 'Enactment of the annual budget', 'LX',
  'The sanggunian enacts the annual appropriations ordinance on or before the '
  'end of the fiscal year. Where it fails to do so, the ordinance of the '
  'preceding year is deemed reenacted and remains in force until the new one is '
  'passed, but only the annual appropriations for salaries and wages, statutory '
  'and contractual obligations and essential operating expenses are deemed '
  'reenacted; no new appropriation for capital outlay or for a new project may '
  'be made under a reenacted budget.',
  'reenacted budget what happens if the budget is not passed on time deadline')

A('617', 'Review of the annual budget', 'LX',
  'The annual and supplemental appropriation ordinances of a province, a highly '
  'urbanised city and an independent component city are reviewed by the Ministry '
  'of Finance, Budget and Management; those of a component city and a '
  'municipality, by the sangguniang panlalawigan; and those of a barangay, by '
  'the sangguniang panlungsod or bayan concerned. The reviewing body acts within '
  '90 days of receipt, and if it fails to act within that period the ordinance '
  'is deemed to have been reviewed in accordance with law and is therefore '
  'valid.',
  'who reviews the budget how long 90 days deemed approved barangay budget review')

A('619', 'The development fund from the National Tax Allotment', 'LX',
  'Each local government unit appropriates in its annual budget no less than 20 '
  'per cent of its annual share from the National Tax Allotment for development '
  'projects, which are embodied in the local development plan and the annual '
  'investment program.',
  '20 percent development fund nta ira how much must be spent on projects')

A('620', 'The local disaster risk reduction and management fund', 'LX',
  'Not less than five per cent of the estimated revenue from regular sources is '
  'set aside as the local disaster risk reduction and management fund, of which '
  '30 per cent is allocated as a quick response fund or stand-by fund for relief '
  'and recovery. The unexpended balance accrues to a special trust fund solely '
  'for disaster risk reduction and management activities within the next five '
  'years, after which it reverts to the general fund.',
  'calamity fund 5 percent quick response 30 percent disaster budget unexpended')

A('621', 'Gender and development and other mandatory allocations', 'LX',
  'Each local government unit allocates at least five per cent of its total '
  'annual budget for gender and development programs; at least one per cent '
  'each for programs for senior citizens and persons with disability, for the '
  'protection of children, and for the construction and maintenance of local '
  'roads; and financial aid of at least ₱1,000 a year to each barangay within '
  'its jurisdiction.',
  'gad budget 5 percent senior citizen pwd children 1 percent mandatory '
  'allocations aid to barangay')

A('622', 'Limitation on personal services', 'LX',
  'The total appropriations for personal services of a local government unit for '
  'one fiscal year may not exceed 45 per cent of the total annual income from '
  'regular sources realized in the preceding fiscal year for a first to third '
  'class province, city or municipality, and 55 per cent for a fourth class or '
  'lower unit. The appropriation for the salary of a newly created position is '
  'included in the computation.',
  'personal services cap limit 45 percent 55 percent salaries budget ceiling')

A('623', 'Limitation on debt service and on discretionary funds', 'LX',
  'The appropriation for debt service may not exceed 20 per cent of the regular '
  'income of the local government unit. A discretionary fund may be appropriated '
  'for the local chief executive at not more than two per cent of the actual '
  'receipts from the basic real property tax in the next preceding calendar '
  'year, and is disbursed only for public purposes supported by appropriate '
  'vouchers.',
  'debt service limit 20 percent discretionary fund intelligence fund mayor '
  '2 percent')

A('624', 'The barangay budget', 'LX',
  'The barangay treasurer submits to the punong barangay a statement of income '
  'and expenditures on or before the 15th of September, and the punong barangay '
  'submits the barangay budget to the sangguniang barangay on or before the 16th '
  'of September. Not less than 10 per cent of the general fund of the barangay '
  'is set aside for the sangguniang kabataan, and the appropriation for personal '
  'services may not exceed 55 per cent of the total annual income actually '
  'realized from local sources in the preceding fiscal year.',
  'barangay budget deadline september 10 percent sk personal services 55 percent')

A('627', 'Barangay funds and the treasurer’s direct purchase', 'LX',
  'The barangay treasurer may make direct purchases amounting to not more than '
  '₱1,000 at any one time for the ordinary and essential needs of the barangay. '
  'The petty cash fund may not exceed 20 per cent of the funds available and to '
  'the credit of the barangay treasury.',
  'barangay treasurer purchase limit 1000 petty cash 20 percent buying supplies')

A('649', 'Procurement by a local government unit', 'LXI',
  'All procurement by a local government unit is governed by the Government '
  'Procurement Reform Act and its implementing rules. Each unit constitutes a '
  'Bids and Awards Committee, and no local chief executive, sanggunian member, '
  'or official with approving authority over the procurement may sit on it.',
  'bidding procurement bac who can sit rules ra 9184 purchase')

A('664', 'Disposal of unserviceable property', 'LXI',
  'Property that has become unserviceable or is no longer needed is disposed of '
  'by the local chief executive with the approval of the sanggunian, at a public '
  'auction after due notice. Where the acquisition cost or book value does not '
  'exceed ₱50,000 for a municipality or ₱100,000 for a province or a city, the '
  'property may be disposed of by negotiated sale or by destruction where it has '
  'no commercial value.',
  'dispose sell old equipment vehicle unserviceable auction threshold 50000 '
  '100000')

# ---------------------------------------------- transitory provisions ----
A('684', 'The Devolution Committee', 'LXIII',
  'A Devolution Committee is constituted to oversee the transfer of services, '
  'personnel, assets and records from the Bangsamoro Government to the local '
  'government units, chaired by the Minister of the Interior and Local '
  'Government. An initial amount of ₱10,000,000 is appropriated for its '
  'operation, chargeable to the annual appropriations of the Ministry.',
  'devolution committee who oversees transfer budget 10 million')

A('690', 'Rules that start only with the May 2028 elections', 'LXIII',
  'The prohibition on political dynasties and the requirement of mandatory '
  'training for elective local officials take effect beginning with the local '
  'elections of May 2028. They do not apply to officials elected before that '
  'date, and an official in office when these Rules took effect serves out the '
  'term for which he was elected.',
  'anti dynasty when does it start is it in effect yet 2028 mandatory training '
  'political dynasty')

A('691', 'The barangays of the Special Geographic Area', 'LXIII',
  'The Special Geographic Area comprises the 63 barangays in the municipalities '
  'of Pikit, Pigkawayan, Carmen, Kabacan, Midsayap and Aleosan in the province '
  'of North Cotabato that voted to join the Bangsamoro Autonomous Region in the '
  'plebiscite of 2019. They remain part of the Bangsamoro Autonomous Region and '
  'are governed by the Code and these Rules.',
  'sga special geographic area how many barangays 63 north cotabato which towns '
  'pikit')

A('692', 'The eight municipalities of the Special Geographic Area', 'LXIII',
  'The 63 barangays of the Special Geographic Area have been constituted into '
  'eight municipalities created by Bangsamoro Autonomy Acts 41 to 48. They are '
  'administered through the Special Geographic Area Development Authority under '
  'the Office of the Chief Minister until they are fully organized.',
  'sga municipalities how many eight new towns baa 41 48 sgada')

A('693', 'Taxation in the Special Geographic Area', 'LXIII',
  'Until a province is created for the Special Geographic Area, the real '
  'property tax and the professional tax within it are levied and collected by '
  'the municipalities concerned, and the proceeds accrue to them and to the '
  'barangays in the shares these Rules prescribe.',
  'sga taxes who collects real property professional tax no province yet')

A('696', 'Effectivity of these Rules', 'LXIII',
  'These Rules take effect 15 days after their publication in the Bangsamoro '
  'Gazette or in a newspaper of general circulation in the Bangsamoro Autonomous '
  'Region. They were promulgated on 30 September 2025.',
  'when did the irr take effect effectivity date published gazette 15 days')

out = {
    'name': 'Implementing Rules and Regulations of the Bangsamoro Local Governance Code of 2023',
    'act': 49,
    'promulgated': '2025-09-30',
    'source': {
        'label': 'Implementing Rules and Regulations of the BLGC of 2023 (Bangsamoro Autonomy Act 49)',
        'href': 'https://parliament.bangsamoro.gov.ph/bta-acts/an-act-providing-for-the-bangsamoro-local-governance-code/',
    },
    'note': (
        'The operative articles of the IRR of the Bangsamoro Local Governance Code, '
        'written out with their figures. It is 696 Articles promulgated on 30 '
        'September 2025; these are the ones that add a procedure, a deadline or a '
        'table to what the Code itself says. Article numbering is the IRR’s own and '
        'does not correspond to the Code’s section numbering. Where an article and '
        'the Code disagree, the Code prevails.'
    ),
    'articles': ARTICLES,
}

seen = {}
for a in ARTICLES:
    if a['n'] in seen:
        raise SystemExit(f"duplicate article {a['n']}")
    seen[a['n']] = True
    if not a['rule'] or not a['heading']:
        raise SystemExit(f"article {a['n']} is missing its rule or heading")

dest = pathlib.Path(__file__).resolve().parents[1] / 'blgc-irr.json'
dest.write_text(json.dumps(out, indent='\t', ensure_ascii=False) + '\n')
print(f"{len(ARTICLES)} articles -> {dest}")
print(f"{dest.stat().st_size/1024:.0f} KB")
