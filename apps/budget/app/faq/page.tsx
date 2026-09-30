import type { Metadata } from 'next'
import { FISCAL_YEARS, budget, budgetFor, formatNumber, pesoTight } from '@betterbarmm/budget-data'
import { LanguageProvider } from '@betterbarmm/editorial'
import { Masthead } from '../_components/budget-parts'
import { FaqList, FaqSearch, FaqSearchProvider, type FaqEntry } from '../_components/faq-list'

export const metadata: Metadata = {
	title: 'FAQs',
	description:
		'What PS, MOOE and capital outlay actually pay for, what a GAAB is, how the budget is made, and what a special purpose fund does — in plain words, with examples.',
}

/* ============================================================
   FAQs

   The vocabulary every other page here uses, answered the way
   somebody would say it out loud.

   Written to the confusion rather than to the definition. Nobody
   is stuck on what "Personnel Services" means as a phrase; they
   are stuck on whether the job-order worker at the health center
   is in it. So most answers carry a yes list and a no list, and
   the no list is the one doing the work — the boundary between
   two classes is where every misreading happens.

   Examples are concrete on purpose. "An ambulance is capital
   outlay, the diesel in it is MOOE, the driver is PS" settles
   three definitions at once in a way three definitions cannot.

   Figures come from the Act rather than the prose, so an eighth
   Act moves them and nobody has to remember to.
   ============================================================ */

const LATEST = budget.fiscalYear
const FIRST = FISCAL_YEARS[FISCAL_YEARS.length - 1]
const { totals, total } = budget
const pct = (amount: number) => `${Math.round((amount / total) * 100)}%`
const year = budgetFor(LATEST)

const funds = year.offices
	.filter((office) => office.kind === 'special_purpose_fund')
	.sort((one, other) => other.totals.total - one.totals.total)
const fundTotal = funds.reduce((sum, one) => sum + one.totals.total, 0)
const fund = (needle: string) => funds.find((one) => one.name.includes(needle))?.totals.total ?? 0

const CLASSES = {
	en: 'The three kinds of spending',
	fil: 'Ang tatlong uri ng paggastos',
}
const ACT = { en: 'The law behind the budget', fil: 'Ang batas sa likod ng badyet' }
const MAKING = {
	en: 'How a budget is made and passed',
	fil: 'Paano ginagawa at ipinapasa ang badyet',
}
const FUNDS = { en: 'Special purpose funds', fil: 'Mga special purpose fund' }
const READING = { en: 'Reading the figures here', fil: 'Pagbasa ng mga numero rito' }

const ENTRIES: FaqEntry[] = [
	// ---- the three classes ----
	{
		group: CLASSES,
		q: { en: 'What is PS?', fil: 'Ano ang PS?' },
		a: {
			en: 'Personnel Services — the payroll. It is what the region pays the people who work for it. Unlike the rest of the budget this part is not really a choice: the salaries are owed whether or not anything else goes ahead.',
			fil: 'Personnel Services — ang suweldo. Ito ang ibinabayad ng rehiyon sa mga taong nagtatrabaho para dito. Hindi ito gaya ng ibang bahagi ng badyet na puwedeng pagpilian: may suweldong dapat bayaran kahit hindi matuloy ang ibang plano.',
		},
		pays: {
			en: [
				'Salaries and wages of permanent staff',
				'Allowances — PERA, clothing, hazard pay',
				'Mid-year and year-end bonuses, cash gift',
				'Overtime and night differential',
				'The government’s share of GSIS, PhilHealth and Pag-IBIG',
				'Terminal leave when someone retires',
			],
			fil: [
				'Suweldo ng mga permanenteng empleyado',
				'Mga allowance — PERA, damit, hazard pay',
				'Bonus sa kalagitnaan at katapusan ng taon, cash gift',
				'Overtime at night differential',
				'Kontribusyon ng gobyerno sa GSIS, PhilHealth at Pag-IBIG',
				'Terminal leave kapag nagretiro',
			],
		},
		notPays: {
			en: [
				'A consultant hired for one project — that is MOOE',
				'A job-order or contract-of-service worker — also MOOE',
				'Training fees and seminars — MOOE',
				'The desk the employee sits at — capital outlay',
			],
			fil: [
				'Konsultant na kinuha para sa isang proyekto — MOOE iyon',
				'Job-order o contract-of-service na manggagawa — MOOE din',
				'Bayad sa training at seminar — MOOE',
				'Ang mesang ginagamit ng empleyado — capital outlay',
			],
		},
		example: {
			en: 'A teacher at a Bangsamoro school: her salary, her allowances and the government’s share of her GSIS are all PS. The chalk, the electricity and her training seminar are not.',
			fil: 'Isang guro sa paaralan ng Bangsamoro: ang suweldo niya, mga allowance at kontribusyon ng gobyerno sa GSIS niya ay pawang PS. Ang tisa, ang kuryente at ang seminar niya ay hindi.',
		},
		figure: `FY ${LATEST} · ${pesoTight(totals.personnel_services)} · ${pct(totals.personnel_services)}`,
		keywords: 'personnel services salary sahod suweldo payroll staff employees empleyado gsis philhealth bonus',
	},
	{
		group: CLASSES,
		q: { en: 'What is MOOE?', fil: 'Ano ang MOOE?' },
		a: {
			en: 'Maintenance and Other Operating Expenses — the cost of running things day to day. There is an easy test: does it get used up within the year? Then it is MOOE.',
			fil: 'Maintenance and Other Operating Expenses — ang gastos sa pang-araw-araw na pagpapatakbo. May simpleng pagsubok: nauubos ba ito sa loob ng taon? Kung oo, MOOE iyon.',
		},
		pays: {
			en: [
				'Electricity, water, internet and phone bills',
				'Fuel, oil and vehicle maintenance',
				'Office supplies, printing, postage',
				'Travel, training and seminars',
				'Rent, janitorial and security services',
				'Medicines and supplies a hospital hands out',
				'Repairs that keep an existing thing working',
				'Scholarships, aid and assistance to people',
			],
			fil: [
				'Kuryente, tubig, internet at telepono',
				'Gasolina, langis at pagpapaayos ng sasakyan',
				'Gamit sa opisina, pag-print, koreo',
				'Biyahe, training at seminar',
				'Upa, janitorial at seguridad',
				'Gamot at supply na ipinamimigay ng ospital',
				'Pagkumpuni ng mayroon nang gamit',
				'Scholarship, ayuda at tulong sa tao',
			],
		},
		notPays: {
			en: [
				'A new building, road or vehicle — capital outlay',
				'The salary of a permanent employee — PS',
				'Equipment expected to last years — capital outlay',
			],
			fil: [
				'Bagong gusali, kalsada o sasakyan — capital outlay',
				'Suweldo ng permanenteng empleyado — PS',
				'Kagamitang tatagal nang maraming taon — capital outlay',
			],
		},
		example: {
			en: 'A rural health unit’s ambulance: the diesel, the tyres and the yearly servicing are MOOE. The ambulance itself is not.',
			fil: 'Ang ambulansya ng rural health unit: ang diesel, ang gulong at ang taunang pagpapa-serbisyo ay MOOE. Ang ambulansya mismo ay hindi.',
		},
		figure: `FY ${LATEST} · ${pesoTight(totals.mooe)} · ${pct(totals.mooe)}`,
		keywords: 'maintenance other operating expenses running costs bills fuel supplies gastos kuryente gasolina',
	},
	{
		group: CLASSES,
		q: { en: 'What is capital outlay?', fil: 'Ano ang capital outlay?' },
		a: {
			en: 'Money for something that is still there next year. If you can point at it after the budget year ends, it was capital outlay — a road, a building, a vehicle, a machine.',
			fil: 'Pera para sa bagay na nandiyan pa sa susunod na taon. Kung maituturo mo pa ito pagkatapos ng taon ng badyet, capital outlay iyon — kalsada, gusali, sasakyan, makina.',
		},
		pays: {
			en: [
				'Roads, bridges, flood control, water systems',
				'School buildings, health centers, offices',
				'Vehicles, ambulances, heavy equipment',
				'Machinery and IT equipment above the capitalisation threshold',
				'Land bought for a public purpose',
			],
			fil: [
				'Kalsada, tulay, flood control, sistema ng tubig',
				'Gusali ng paaralan, health center, opisina',
				'Sasakyan, ambulansya, mabibigat na kagamitan',
				'Makinarya at IT equipment na lampas sa capitalisation threshold',
				'Lupang binili para sa publiko',
			],
		},
		notPays: {
			en: [
				'Repairs and maintenance of something you already own — MOOE',
				'Rent — you do not end up owning it',
				'Salaries of the people who build it, where they are regular staff — PS',
			],
			fil: [
				'Pagkumpuni ng pag-aari mo na — MOOE',
				'Upa — hindi naman ito napupunta sa iyo',
				'Suweldo ng regular na tauhang gumagawa nito — PS',
			],
		},
		example: {
			en: 'One ambulance settles all three classes: buying it is capital outlay, the diesel and servicing are MOOE, the driver on the plantilla is PS.',
			fil: 'Isang ambulansya ang nagpapaliwanag sa tatlo: ang pagbili nito ay capital outlay, ang diesel at pagpapa-serbisyo ay MOOE, ang drayber na nasa plantilla ay PS.',
		},
		figure: `FY ${LATEST} · ${pesoTight(totals.capital_outlays)} · ${pct(totals.capital_outlays)}`,
		keywords: 'co capital outlays infrastructure building construction equipment assets gusali kalsada',
	},
	{
		group: CLASSES,
		q: {
			en: 'Why do the three always add up to the whole budget?',
			fil: 'Bakit palaging umaabot sa buong badyet ang tatlo?',
		},
		a: {
			en: 'Because every peso has to be one of them. There is no fourth box. The Act splits the money this way itself, in its Section 1 — it is not our reading of it. That is why you can add these three together, and why you cannot add the sectors on other pages.',
			fil: 'Dahil bawat piso ay kailangang mapabilang sa isa sa tatlo. Walang pang-apat. Ang Batas mismo ang naghahati nang ganito, sa Section 1 nito — hindi ito pagbasa namin. Kaya puwedeng pagsamahin ang tatlong ito, at kaya hindi puwedeng pagsamahin ang mga sektor sa ibang pahina.',
		},
		keywords: 'expense class section 1 total sum add kabuuan',
	},

	// ---- the Act ----
	{
		group: ACT,
		q: { en: 'What is a GAAB?', fil: 'Ano ang GAAB?' },
		a: {
			en: `The law that says what the region may spend, and on what, for one year. Without it no public money can legally move. A ministry cannot pay a salary or sign a contract unless a line in the GAAB covers it. A new one is passed every year and it ends when the year does. The one in force now is ${budget.actLong}.`,
			fil: `Ang batas na nagsasabi kung ano ang puwedeng gastusin ng rehiyon, at saan, sa loob ng isang taon. Kung wala ito, walang perang pampubliko ang legal na makikilos. Hindi makakapagsuweldo o makakapirma ng kontrata ang isang ministri kung walang linya sa GAAB para rito. Bago ang ipinapasa taon-taon at nagtatapos ito kasabay ng taon. Ang ipinatutupad ngayon ay ${budget.actLong}.`,
		},
		example: {
			en: 'A ministry wants to build a health station that is not in the Act. It cannot — not because the money is short, but because no line authorises it. It waits for next year’s GAAB, or for a supplemental Act.',
			fil: 'Gustong magpatayo ng health station ng isang ministri pero wala ito sa Batas. Hindi puwede — hindi dahil kulang ang pera, kundi dahil walang linyang nagpapahintulot. Maghihintay ito sa GAAB sa susunod na taon, o sa supplemental na Batas.',
		},
		keywords: 'gaab general appropriations act budget law batas badyet',
	},
	{
		group: ACT,
		q: { en: 'What is a BAA?', fil: 'Ano ang BAA?' },
		a: {
			en: `Any law the Bangsamoro Parliament passes. They are numbered one after another, starting from the region’s first. The budget is not a special kind of law — it is just the BAA that happens to be the budget, in the same numbering as everything else. This year’s is BAA ${budget.act}.`,
			fil: `Alinmang batas na ipinasa ng Parlamento ng Bangsamoro. Sunod-sunod ang numero, simula sa kauna-unahan ng rehiyon. Hindi espesyal na uri ng batas ang badyet — BAA rin ito, kasama sa parehong numerasyon ng lahat. Ang sa taong ito ay BAA ${budget.act}.`,
		},
		example: {
			en: 'BAA 49 is the Bangsamoro Local Governance Code. BAA 85 is this year’s budget. Same sequence, same Parliament — one is a permanent code, the other expires in December.',
			fil: 'Ang BAA 49 ay ang Bangsamoro Local Governance Code. Ang BAA 85 ay ang badyet ngayong taon. Parehong pagkakasunod-sunod, parehong Parlamento — permanenteng kodigo ang isa, nagtatapos sa Disyembre ang isa.',
		},
		keywords: 'baa bangsamoro autonomy act parliament law numbering parlamento batas',
	},
	{
		group: ACT,
		q: { en: 'What is a fiscal year here?', fil: 'Ano ang piskal na taon dito?' },
		a: {
			en: `The calendar year — 1 January to 31 December — so FY ${LATEST} is just ${LATEST}. It matters because cash does not sit still. Whatever is left in an office’s account at 11.59pm on 30 June, and again on 31 December, reverts automatically to the Bangsamoro Treasury — which is why offices rush twice a year, not once. This site holds ${FISCAL_YEARS.length} years, FY ${FIRST} to FY ${LATEST}: every budget the region has ever passed.`,
			fil: `Ang taon ng kalendaryo — 1 Enero hanggang 31 Disyembre — kaya ang FY ${LATEST} ay ${LATEST} lang. Mahalaga ito dahil hindi nakatengga ang pera. Ang natitira sa account ng opisina sa 11.59 ng gabi tuwing 30 Hunyo, at muli sa 31 Disyembre, ay awtomatikong bumabalik sa Bangsamoro Treasury — kaya dalawang beses sa isang taon nagmamadali ang mga opisina, hindi minsan. ${FISCAL_YEARS.length} taon ang nasa site na ito, FY ${FIRST} hanggang FY ${LATEST}: lahat ng badyet na naipasa ng rehiyon.`,
		},
		example: {
			en: `FY ${FIRST} is the region’s first budget. Before that there was no Bangsamoro Government to hold one — which is why this workspace starts where it does rather than going back further.`,
			fil: `Ang FY ${FIRST} ang unang badyet ng rehiyon. Wala pang Pamahalaang Bangsamoro bago niyan para magkaroon nito — kaya rito nagsisimula ang workspace na ito at hindi mas maaga.`,
		},
		keywords: 'fiscal year fy calendar taon january december enero disyembre kalendaryo',
	},
	{
		group: ACT,
		q: { en: 'What is a special provision?', fil: 'Ano ang special provision?' },
		a: {
			en: `A condition written into the Act about one particular appropriation — what it may be spent on, what has to be reported, or what must happen first. The FY ${LATEST} Act carries ${formatNumber(year.provisions.length)} of them.`,
			fil: `Kondisyong nakasulat sa Batas tungkol sa isang partikular na alokasyon — saan lang ito puwedeng gastusin, ano ang kailangang i-report, o ano ang dapat maunang mangyari. May ${formatNumber(year.provisions.length)} nito ang Batas ng FY ${LATEST}.`,
		},
		example: {
			en: 'A provision might say a scholarship fund may only go to students enrolled in the region, that the ministry must report the list every quarter, and that nothing may be released until the guidelines are published. Three conditions, one appropriation — and each one is enforceable.',
			fil: 'Puwedeng sabihin ng isang provision na ang pondo sa scholarship ay para lamang sa mga estudyanteng naka-enroll sa rehiyon, na kailangang i-report ng ministri ang listahan kada quarter, at walang ilalabas hangga’t hindi naipapalabas ang guidelines. Tatlong kondisyon, isang alokasyon — at bawat isa ay maipatutupad.',
		},
		notPays: {
			en: ['They are rules about money other lines already hold, so they are never added to a total'],
			fil: ['Patakaran ito tungkol sa perang nasa ibang linya na, kaya hindi ito idinaragdag sa kabuuan'],
		},
		keywords: 'special provision condition proviso requirement kondisyon patakaran',
	},

	// ---- the process ----
	{
		group: MAKING,
		q: { en: 'What is the budget process?', fil: 'Ano ang proseso ng badyet?' },
		a: {
			en: 'Four stages. The ministries ask for what they want and the finance ministry decides how much they can have. Parliament then goes through it, changes what it wants, and passes it into law. After that the finance ministry releases the money and the ministries spend it. At the end, auditors check what was actually spent. The Process page walks through each stage.',
			fil: 'Apat na yugto. Hinihingi ng mga ministri ang gusto nila at ang ministri ng pinansiya ang nagpapasya kung magkano ang puwede. Dumadaan ito sa Parlamento, na nagbabago ng gusto nitong baguhin at nagsasabatas nito. Pagkatapos, inilalabas ng ministri ng pinansiya ang pera at ginagastos ng mga ministri. Sa dulo, sinusuri ng mga auditor kung ano talaga ang nagastos. Nasa pahinang Process ang bawat yugto.',
		},
		keywords: 'budget process phases preparation legislation execution accountability proseso yugto',
	},
	{
		group: MAKING,
		q: {
			en: 'What happens if Parliament does not pass it in time?',
			fil: 'Ano ang mangyayari kung hindi ito maipasa ng Parlamento sa takdang panahon?',
		},
		a: {
			en: 'Last year’s Act is reenacted and stays in force until the new one passes — but stripped back: salaries, obligations the law already requires, and essential running costs. Nothing new starts. A road in the new budget waits, a new position stays unfilled, and the region runs on last year’s shape at last year’s size however much the world has changed.',
			fil: 'Muling ipinatutupad ang Batas noong nakaraang taon hanggang maipasa ang bago — pero pinaliit: suweldo, mga obligasyong itinatakda na ng batas, at mahahalagang gastos sa pagpapatakbo. Walang bagong sisimulan. Maghihintay ang kalsadang nasa bagong badyet, mananatiling bakante ang bagong posisyon, at aandar ang rehiyon sa hugis at laki noong nakaraang taon gaano man nagbago ang panahon.',
		},
		example: {
			en: 'A ministry granted a bigger budget in the new Act still spends at the old figure until it passes. The increase is not available early just because Parliament intends it.',
			fil: 'Ang ministring binigyan ng mas malaking badyet sa bagong Batas ay gagastos pa rin sa lumang halaga hanggang maipasa ito. Hindi maagang magagamit ang dagdag dahil lang balak ito ng Parlamento.',
		},
		keywords: 'reenacted budget late not passed delay deadline hindi naipasa',
	},
	{
		group: MAKING,
		q: { en: 'Where does the money come from?', fil: 'Saan nanggagaling ang pera?' },
		a: {
			en: 'Mostly a yearly block grant from the national government. It is a formula, not a negotiation: the Organic Law sets it at 5% of national tax collections and it arrives automatically. That is the point of it — the region can plan ahead, and a change of politics in Manila does not change what comes in. The rest is the region’s cut of taxes collected here, its share of natural resources, and what it raises itself.',
			fil: 'Karamihan ay taunang block grant mula sa pambansang gobyerno. Pormula ito, hindi tawaran: itinakda ng Organic Law sa 5% ng koleksiyon ng buwis pambansa at awtomatiko itong dumarating. Iyan ang punto nito — makakapagplano ang rehiyon nang maaga, at hindi nagbabago ang pumapasok kahit magbago ang pulitika sa Maynila. Ang natitira ay bahagi ng rehiyon sa buwis na nakokolekta rito, sa yamang likas, at sa sarili nitong kinikita.',
		},
		example: {
			en: 'The block grant is why the region’s budget has grown steadily rather than in jumps: it tracks national tax collection, not a yearly bargain.',
			fil: 'Ang block grant ang dahilan kung bakit tuloy-tuloy ang paglaki ng badyet ng rehiyon at hindi pabigla-bigla: sumusunod ito sa koleksiyon ng buwis pambansa, hindi sa taunang tawaran.',
		},
		keywords: 'block grant funding source money comes from national government pera saan galing kita buwis',
	},
	{
		group: MAKING,
		q: { en: 'What do MFBM and the BTO do?', fil: 'Ano ang ginagawa ng MFBM at ng BTO?' },
		a: {
			en: 'The Ministry of Finance, and Budget and Management — MFBM — puts the budget together before it goes to Parliament, and afterwards decides when each office may actually use its money. The Bangsamoro Treasury Office sits under it and is where the money is held and paid out from. Between them they control the timing of almost everything, which is why a line in the Act is not the same as money in hand.',
			fil: 'Ang Ministry of Finance, and Budget and Management — MFBM — ang nagtitipon ng badyet bago ito dalhin sa Parlamento, at siya rin ang nagpapasya kung kailan magagamit ng bawat opisina ang pera nito. Nasa ilalim nito ang Bangsamoro Treasury Office, at doon hinahawakan at binabayad ang pera. Silang dalawa ang may hawak ng timing ng halos lahat, kaya hindi pareho ang linya sa Batas at ang perang nasa kamay na.',
		},
		pays: {
			en: [
				'MFBM sets the limits each office may ask within',
				'MFBM assembles the ministries’ requests into one budget',
				'MFBM releases the allotment and the cash, after the Act has passed',
				'BTO holds the funds and makes the payments',
				'BTO receives money that reverts at the end of the year, and reports on transfers',
			],
			fil: [
				'Ang MFBM ang nagtatakda ng limitasyong puwedeng hingin ng bawat opisina',
				'Ang MFBM ang nagsasama-sama ng hiling ng mga ministri sa isang badyet',
				'Ang MFBM ang naglalabas ng allotment at ng pera, matapos maipasa ang Batas',
				'Ang BTO ang humahawak ng pondo at nagbabayad',
				'Sa BTO bumabalik ang perang hindi nagamit sa dulo ng taon, at ito ang nag-uulat ng mga paglilipat',
			],
		},
		example: {
			en: 'A ministry can have a project in the Act in January and still not be able to start it in June, because MFBM has not released the money yet. Nothing has gone wrong — the release is a separate decision.',
			fil: 'Puwedeng nasa Batas na ang proyekto ng isang ministri noong Enero pero hindi pa rin ito masimulan sa Hunyo, dahil hindi pa inilalabas ng MFBM ang pera. Walang namali — hiwalay na desisyon ang paglalabas.',
		},
		keywords: 'mfbm bto treasury finance budget management allotment release cash allocation paglalabas',
	},
	{
		group: MAKING,
		q: {
			en: 'Is an appropriation the same as money spent?',
			fil: 'Pareho ba ang alokasyon at ang aktwal na nagastos?',
		},
		a: {
			en: 'No — and this is the most important thing on this page. An appropriation is permission to spend, granted before the year begins. What was actually spent, and what got built with it, is a separate record the region does not publish. Every figure on this workspace is what was promised, never what happened.',
			fil: 'Hindi — at ito ang pinakamahalagang bagay sa pahinang ito. Ang alokasyon ay pahintulot lamang na gumastos, ibinibigay bago magsimula ang taon. Ang aktwal na nagastos, at kung ano ang naitayo mula rito, ay hiwalay na talaan na hindi inilalathala ng rehiyon. Bawat numero sa workspace na ito ay pangako, hindi nangyari.',
		},
		keywords: 'appropriation obligation disbursement spent actual expenditure gastos utilization alokasyon pangako',
	},

	// ---- the funds ----
	{
		group: FUNDS,
		q: { en: 'What is a special purpose fund?', fil: 'Ano ang special purpose fund?' },
		a: {
			en: `Money set aside with no office named to spend it. Every other line in the Act says who gets it — a ministry, an office, a commission. A special purpose fund only says what it is for. It sits there as one lump until something happens, and is then handed to whichever ministry has to deal with it. This year’s Act has ${funds.length} of them.`,
			fil: `Perang nakatabi na walang nakatakdang opisinang gagastos. Bawat ibang linya sa Batas ay may nakalagay kung kanino — ministri, opisina, komisyon. Ang special purpose fund ay may layunin lang. Nakatabi ito bilang isang buo hanggang may mangyari, saka ibinibigay sa ministring kailangang humawak nito. May ${funds.length} nito ang Batas ngayong taon.`,
		},
		pays: {
			en: [
				'Things that cannot be scheduled — a typhoon, an outbreak',
				'Obligations that fall due across every ministry at once, like pensions',
				'Money the region is owed by national law and must appropriate somewhere',
				'Large programs whose implementing office is not settled when the Act is written',
			],
			fil: [
				'Mga bagay na hindi maiiskedyul — bagyo, pagsiklab ng sakit',
				'Obligasyong sabay-sabay sa lahat ng ministri, tulad ng pensiyon',
				'Perang nakalaan sa rehiyon ayon sa batas at kailangang ilagay sa isang lugar',
				'Malalaking programang hindi pa tiyak kung sinong opisina ang magpapatupad',
			],
		},
		notPays: {
			en: [
				'It is not extra money — it is inside the total like every other line',
				'It is not spent by the fund; a ministry spends it once it is released',
				'It is not unaccounted for — the Commission on Audit follows it like anything else',
			],
			fil: [
				'Hindi ito dagdag na pera — kasama ito sa kabuuan gaya ng ibang linya',
				'Hindi ang pondo ang gumagastos; ministri ang gagastos kapag inilabas na',
				'Hindi ito walang pananagutan — sinusundan ito ng Commission on Audit gaya ng iba',
			],
		},
		example: {
			en: 'A typhoon hits Basilan in March. Nobody could have written a line for it in October, so the Quick Response Fund is drawn on and released to the ministry that has to move — the money was appropriated without a name in advance precisely so that it did not need one on the day.',
			fil: 'Tumama ang bagyo sa Basilan tuwing Marso. Walang makakasulat ng linya para rito noong Oktubre, kaya kinukuha ito sa Quick Response Fund at inilalabas sa ministring kailangang kumilos — inilaan ang pera nang walang pangalan nang maaga para hindi na ito kailanganin sa mismong araw.',
		},
		figure: `FY ${LATEST} · ${pesoTight(fundTotal)} · ${pct(fundTotal)}`,
		keywords: 'spf special purpose fund lump sum unprogrammed reserve pondo release allotment',
	},
	{
		group: FUNDS,
		q: {
			en: 'Is a special purpose fund a bad thing?',
			fil: 'Masama ba ang special purpose fund?',
		},
		a: {
			en: 'Not by itself. Some money really cannot be assigned ahead of time, and a budget with no reserve would need a new law every time something went wrong. The cost is that you cannot follow it: while the money sits in a fund you can see the amount but not the plan, so there is no way to tell what will be built or where. The thing to watch is not whether these funds exist but how big a share of the budget they take.',
			fil: 'Hindi sa sarili nito. May perang talagang hindi maitatakda nang maaga, at ang badyet na walang reserba ay mangangailangan ng bagong batas tuwing may masamang mangyayari. Ang kapalit: hindi mo ito masusundan. Habang nasa pondo ang pera, nakikita mo ang halaga pero hindi ang plano, kaya walang paraan para malaman kung ano ang itatayo o saan. Ang dapat bantayan ay hindi kung may ganitong pondo kundi kung gaano kalaki ang bahagi nito sa badyet.',
		},
		example: {
			en: `In FY 2021 the funds were 10% of the Act. In FY ${LATEST} they are ${pct(fundTotal)}. The same mechanism, four times the share of the budget — which is the sort of change the Composition page exists to show.`,
			fil: `Noong FY 2021, 10% ng Batas ang mga pondo. Sa FY ${LATEST}, ${pct(fundTotal)} na. Parehong mekanismo, apat na beses ang bahagi sa badyet — ganitong pagbabago ang dahilan kung bakit may pahinang Composition.`,
		},
		keywords: 'lump sum criticism transparency traceability pork discretion accountability bantay',
	},
	{
		group: FUNDS,
		q: { en: 'What is the Special Development Fund?', fil: 'Ano ang Special Development Fund?' },
		a: {
			en: 'Money the national government pays the region under the Bangsamoro Organic Law for rebuilding and development, over ten years, appropriated here year by year. It is not the block grant and not a share of taxes — it is a separate settlement for the rebuilding the region needed when it was formed.',
			fil: 'Perang ibinabayad ng pambansang gobyerno sa rehiyon sa ilalim ng Bangsamoro Organic Law para sa muling pagtatayo at pag-unlad, sa loob ng sampung taon, inilalaan dito taon-taon. Hindi ito ang block grant ni bahagi sa buwis — hiwalay itong kasunduan para sa muling pagtatayong kailangan ng rehiyon nang mabuo ito.',
		},
		example: {
			en: 'Roads, water systems and public buildings in areas the conflict left without them — the kind of rebuilding that outlasts one budget year and so was funded as a decade rather than a line.',
			fil: 'Mga kalsada, sistema ng tubig at gusaling pampubliko sa mga lugar na naiwan ng digmaan — ganitong muling pagtatayo na lalampas sa isang taon ng badyet, kaya isang dekada ang pinondohan at hindi isang linya.',
		},
		figure: `FY ${LATEST} · ${pesoTight(fund('Special Development'))}`,
		keywords: 'sdf special development fund organic law rehabilitation pag-unlad',
	},
	{
		group: FUNDS,
		q: { en: 'What is the Contingent Fund?', fil: 'Ano ang Contingent Fund?' },
		a: {
			en: 'A reserve for things nobody could foresee when the Act was written, released by the Chief Minister as they come up. It is the widest of the funds, which is why its share is worth watching.',
			fil: 'Reserbang pondo para sa mga bagay na hindi inaasahan noong isinusulat ang Batas, inilalabas ng Chief Minister kapag nangyari na. Ito ang pinakamalawak sa mga pondo, kaya dapat bantayan ang bahagi nito.',
		},
		example: {
			en: 'A court orders the region to pay a settlement, or a national agency withdraws from a program mid-year and the region has to carry it. Neither was knowable in October.',
			fil: 'Iniutos ng korte na magbayad ang rehiyon, o umatras ang isang pambansang ahensiya sa isang programa sa gitna ng taon at ang rehiyon ang kailangang magpatuloy. Wala sa dalawang ito ang alam noong Oktubre.',
		},
		figure: `FY ${LATEST} · ${pesoTight(fund('Contingent'))}`,
		keywords: 'contingent fund reserve unforeseen emergency reserba',
	},
	{
		group: FUNDS,
		q: { en: 'What is the Quick Response Fund?', fil: 'Ano ang Quick Response Fund?' },
		a: {
			en: 'A standby fund for relief and early recovery straight after a disaster, so help does not have to wait for a supplemental budget. A supplemental budget is another Act, and an Act takes weeks — which is the whole reason this fund exists.',
			fil: 'Nakahandang pondo para sa relief at maagang pagbangon agad pagkatapos ng sakuna, para hindi na maghintay pa ng supplemental na badyet ang tulong. Ang supplemental na badyet ay isa pang Batas, at linggo ang aabutin ng isang Batas — iyan ang buong dahilan kung bakit may ganitong pondo.',
		},
		example: {
			en: 'Food, tarpaulins and temporary shelter in the week after a typhoon; clearing a road so the aid can reach the barangay at all.',
			fil: 'Pagkain, trapal at pansamantalang silungan sa linggo matapos ang bagyo; paglilinis ng kalsada para makarating man lang ang ayuda sa barangay.',
		},
		figure: `FY ${LATEST} · ${pesoTight(fund('Quick Response'))}`,
		keywords: 'qrf quick response fund disaster calamity relief bagyo lindol sakuna ayuda',
	},
	{
		group: FUNDS,
		q: {
			en: 'Why are the funds shown apart from the ministries?',
			fil: 'Bakit hiwalay ang mga pondo sa mga ministri?',
		},
		a: {
			en: 'Because they are not places anyone works. Listed down one column beside the ministries they read as peers, which misleads — a ministry is an office with staff and a mandate, a fund is a sum waiting to be assigned. On the Composition page they have a strip of their own and are left out of the office table.',
			fil: 'Dahil hindi ito mga lugar na may nagtatrabaho. Kapag magkatabi sila sa iisang hanay, parang magkapantay sila — nakalilito iyon: ang ministri ay opisinang may tauhan at mandato, ang pondo ay halagang naghihintay pa kung kanino mapupunta. Sa pahinang Composition may sariling bahagi sila at wala sila sa talahanayan ng mga opisina.',
		},
		keywords: 'why separate funds ministries composition column partition bakit hiwalay',
	},

	// ---- reading it ----
	{
		group: READING,
		q: {
			en: 'Why can sectors not be added together?',
			fil: 'Bakit hindi puwedeng pagsamahin ang mga sektor?',
		},
		a: {
			en: 'Because they overlap. A sector is our reading of what a line is about, and a program tagged both Health and Infrastructure gets counted under both. You can follow one sector across the years. You just cannot add the rows up.',
			fil: 'Dahil nagsasapawan sila. Ang sektor ay pagbasa ng workspace na ito kung tungkol saan ang isang linya, at ang programang may tatak na Health at Infrastructure ay bilang sa pareho. Puwedeng basahin ang isang sektor sa paglipas ng mga taon; huwag lang pagsamahin ang mga hanay.',
		},
		keywords: 'sector subject overlap double count tags sum sektor nagsasapawan',
	},
	{
		group: READING,
		q: { en: 'Are these your figures or the Act’s?', fil: 'Kanino ang mga numerong ito — sa inyo o sa Batas?' },
		a: {
			en: 'The Act’s, down to the centavo, copied as printed. Every page number shown is the Act’s own. The files are on the Sources page, so you can check any figure against the page it came from.',
			fil: 'Sa Batas, hanggang sentimo, kinopya gaya ng pagkalimbag at pinagtugma sa pagitan ng mga taon. Bawat numero ng pahinang nakikita mo ay sa Batas mismo. Nasa pahinang Sources ang mga file, kaya masusuri ang alinmang numero laban sa pahinang pinagmulan nito.',
		},
		keywords: 'sources accuracy verify check trust extraction pdf pinagmulan suriin',
	},
]

export default function FaqPage() {
	return (
		/* The provider sits above the masthead rather than around the list alone,
		   so anything bilingual added to the head later is already inside it. */
		<LanguageProvider>
			<FaqSearchProvider entries={ENTRIES}>
				<Masthead
					center
					kicker='FAQs'
					title='Understand the words first,'
					titleMuted='then the figures.'
				>
					<FaqSearch />
				</Masthead>

				<section className='bb-container section-band'>
					<FaqList />
				</section>
			</FaqSearchProvider>
		</LanguageProvider>
	)
}
