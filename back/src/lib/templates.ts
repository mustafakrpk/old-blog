import type { Node } from "@/db/schema"

// Şablon node'u: insert için gereken alanlar (workspaceId server'da eklenir).
export type TemplateNode = Pick<
	Node,
	"id" | "title" | "type" | "cluster" | "visibility" | "val"
> & {
	content?: string | null
	meta?: Node["meta"]
}

export interface Template {
	key: string
	name: string
	emoji: string
	description: string
	nodes: TemplateNode[]
	links: Array<{ source: string; target: string }>
}

// Worldbuilding node'u: tip'e göre boyut, açıklama meta'ya.
function w(
	id: string,
	title: string,
	type: Node["type"],
	description: string,
): TemplateNode {
	const val =
		type === "hub"
			? 8
			: type === "faction" || type === "location"
				? 3
				: 2
	return {
		id,
		title,
		type,
		cluster: "core",
		visibility: "professional",
		val,
		content: null,
		meta: { description },
	}
}

export const TEMPLATES: Template[] = [
	{
		key: "epic-fantasy",
		name: "Epic Fantasy",
		emoji: "⚔️",
		description:
			"A high-fantasy realm where a foretold hero, an undying dark lord, and warring orders collide over an ancient magic.",
		nodes: [
			w("aethelgard", "Aethelgard", "hub", "A sundered realm of storm-wracked kingdoms and buried gods, where the light of the last free crowns flickers against a rising, ageless dark."),
			w("kaelith-dawnbound", "Kaelith the Dawnbound", "character", "A borderland shepherd who woke with starlight in her veins and a destiny she never asked to carry."),
			w("malgrath-the-undying", "Malgrath the Undying", "character", "A once-mortal archmage who tore out his own death and now hungers to unmake the living world in his image."),
			w("elowen-the-seer", "Elowen the Seer", "character", "A blind oracle who reads tomorrow in the ash of dead stars and has waited a lifetime for the Dawnbound to arrive."),
			w("silverhold", "Silverhold, the Last Crown", "location", "A tiered mountain-city of mirrored spires and hanging bridges, the final free kingdom standing between the world and the dark."),
			w("the-blighted-spire", "The Blighted Spire", "location", "A black needle of fused bone and iron rising from a poisoned marsh, where daylight dies at the threshold."),
			w("luminar-conclave", "The Luminar Conclave", "faction", "An austere order of robed mage-scholars sworn to guard the pure flame of aether against corruption."),
			w("ashen-legion", "The Ashen Legion", "faction", "A tide of grey-armored revenants and broken oath-knights marching under the banner of the Undying King."),
			w("prophecy-of-twin-dawns", "The Prophecy of the Twin Dawns", "lore", "An ancient verse foretelling that one dawn will crown a savior and the other will burn the world, and only a single soul chooses which."),
			w("aetherweaving", "Aetherweaving", "lore", "The living art of drawing threads of starfire through the blood, radiant in the pure of heart and rotting in the greedy."),
			w("the-dawnshard", "The Dawnshard", "item", "A blade forged from a fallen fragment of the first sun, the only edge that can wound a thing that has abandoned death."),
			w("vhyrax-emberwyrm", "Vhyrax the Emberwyrm", "creature", "The last elder dragon, keeper of the sun-forge, who tests every seeker with fire before deciding whether they are worthy of it."),
			w("the-sundering-war", "The Sundering War", "event", "The realm-shattering conflict, prophesied and inevitable, in which the fate of every living kingdom will be decided beneath Silverhold's walls."),
		],
		links: [
			{ source: "aethelgard", target: "silverhold" },
			{ source: "aethelgard", target: "kaelith-dawnbound" },
			{ source: "aethelgard", target: "malgrath-the-undying" },
			{ source: "aethelgard", target: "prophecy-of-twin-dawns" },
			{ source: "aethelgard", target: "aetherweaving" },
			{ source: "aethelgard", target: "the-sundering-war" },
			{ source: "kaelith-dawnbound", target: "silverhold" },
			{ source: "kaelith-dawnbound", target: "the-dawnshard" },
			{ source: "kaelith-dawnbound", target: "prophecy-of-twin-dawns" },
			{ source: "kaelith-dawnbound", target: "elowen-the-seer" },
			{ source: "kaelith-dawnbound", target: "malgrath-the-undying" },
			{ source: "elowen-the-seer", target: "prophecy-of-twin-dawns" },
			{ source: "elowen-the-seer", target: "luminar-conclave" },
			{ source: "luminar-conclave", target: "aetherweaving" },
			{ source: "luminar-conclave", target: "silverhold" },
			{ source: "luminar-conclave", target: "the-sundering-war" },
			{ source: "malgrath-the-undying", target: "the-blighted-spire" },
			{ source: "malgrath-the-undying", target: "ashen-legion" },
			{ source: "malgrath-the-undying", target: "aetherweaving" },
			{ source: "ashen-legion", target: "the-blighted-spire" },
			{ source: "ashen-legion", target: "the-sundering-war" },
			{ source: "the-sundering-war", target: "silverhold" },
			{ source: "the-dawnshard", target: "malgrath-the-undying" },
			{ source: "vhyrax-emberwyrm", target: "the-dawnshard" },
			{ source: "vhyrax-emberwyrm", target: "kaelith-dawnbound" },
		],
	},
	{
		key: "sci-fi-universe",
		name: "Sci-Fi Universe",
		emoji: "🚀",
		description:
			"A space-opera galaxy of warring empires, a rogue navigator, and an ancient key that bends spacetime.",
		nodes: [
			w("aurelian-expanse", "The Aurelian Expanse", "hub", "A vast spiral of contested star systems where fallen empires, alien enclaves, and smuggler routes tangle across the dark."),
			w("kaelis-vorn", "Kaelis Vorn, the Wayless Pilot", "character", "A disgraced Dominion navigator turned Coalition runner, haunted by a jump that vanished her entire fleet."),
			w("oracle-nine", "Oracle-Nine", "character", "A rogue shipboard intelligence that dreams in probability and whispers routes no living mind could chart."),
			w("solari-dominion", "The Solari Dominion", "faction", "An ancient sun-worshipping empire that rules a thousand worlds through orbital cathedrals and iron decree."),
			w("verge-coalition", "The Verge Coalition", "faction", "A ragtag alliance of border colonies and freeborn crews fighting to break the Dominion's grip on the jump lanes."),
			w("thessa-prime", "Thessa Prime", "location", "The Dominion's blazing capital world, its cities ringed by mirror-arrays that harvest a captive dying star."),
			w("halcyon-reach", "Halcyon Reach", "location", "A neutral deep-space station carved from a hollow moon, where spies, exiles, and alien envoys trade in secrets."),
			w("ashen-belt", "The Ashen Belt", "location", "A graveyard asteroid field littered with the burnt hulls of a war fleet that never returned home."),
			w("the-sundering-war", "The Sundering War", "event", "The cataclysmic conflict that shattered the old order when the jump lanes themselves were weaponized."),
			w("the-vashai", "The Vashai", "creature", "A luminous silicate species that perceives spacetime as sound and remembers the galaxy's every fold."),
			w("starforge-key", "The Starforge Key", "item", "A palm-sized relic of impossible geometry that can pry open new passages through the deep fold."),
			w("the-fold", "The Fold", "lore", "The hidden substrate beneath reality through which ships jump, alive with currents that can save or swallow a fleet."),
		],
		links: [
			{ source: "aurelian-expanse", target: "kaelis-vorn" },
			{ source: "aurelian-expanse", target: "solari-dominion" },
			{ source: "aurelian-expanse", target: "verge-coalition" },
			{ source: "aurelian-expanse", target: "the-sundering-war" },
			{ source: "aurelian-expanse", target: "the-fold" },
			{ source: "solari-dominion", target: "thessa-prime" },
			{ source: "solari-dominion", target: "the-sundering-war" },
			{ source: "verge-coalition", target: "the-sundering-war" },
			{ source: "verge-coalition", target: "halcyon-reach" },
			{ source: "kaelis-vorn", target: "verge-coalition" },
			{ source: "kaelis-vorn", target: "thessa-prime" },
			{ source: "kaelis-vorn", target: "oracle-nine" },
			{ source: "kaelis-vorn", target: "starforge-key" },
			{ source: "oracle-nine", target: "the-fold" },
			{ source: "starforge-key", target: "the-fold" },
			{ source: "the-sundering-war", target: "ashen-belt" },
			{ source: "the-vashai", target: "halcyon-reach" },
			{ source: "the-vashai", target: "the-fold" },
		],
	},
	{
		key: "mythology-and-legends",
		name: "Mythology & Legends",
		emoji: "⚡",
		description:
			"A woven pantheon of gods, mortals, and mythic realms born from a single first song.",
		nodes: [
			w("vaelmyr-the-woven-realms", "Vaelmyr, the Woven Realms", "hub", "The whole of creation, sung into being and stitched from sky, sea, and ember by warring divine hands."),
			w("solivane-the-dawnfather", "Solivane the Dawnfather", "character", "The radiant sky-god whose breath kindled the first sunrise and whose crown holds the world aloft."),
			w("nyrrha-the-tidequeen", "Nyrrha the Tidequeen", "character", "Moon-eyed goddess of tide and dream who cradles the drowned dead and whispers fate to sleepers."),
			w("morvael-the-hollow", "Morvael the Hollow", "character", "A god unmade by envy, now a shadow-shape that unravels every song he touches."),
			w("kaeloran-the-ashbound", "Kaeloran the Ashbound", "character", "A mortal smith-hero marked by a scar of living cinder, sworn to end the serpent's long hunger."),
			w("the-sunspire", "The Sunspire", "location", "A mountain of white fire piercing the heavens where the sky-gods hold their burning court."),
			w("the-drowned-vault", "The Drowned Vault", "location", "A sunless sea-cavern beneath the world where lost souls drift and forgotten gods sleep."),
			w("emberhold", "Emberhold", "location", "A mortal city of forge-smoke and lantern-light built around an eternal flame that never gutters."),
			w("the-emberkin-order", "The Emberkin Order", "faction", "A brotherhood of firekeepers and hero-smiths who guard the last sparks of the Dawnfather's flame."),
			w("the-sundering", "The Sundering", "event", "The night Morvael tore the First Song in two, splitting one whole world into rival realms of light and deep."),
			w("the-first-song", "The First Song", "lore", "The primordial melody whose every note became a star, a sea, or a soul."),
			w("the-heartflame-shard", "The Heartflame Shard", "item", "A splinter of the Dawnfather's own fire, blinding to the wicked and warm to the worthy."),
			w("the-veil-serpent", "The Veil Serpent", "creature", "A world-coiling wyrm born of the Sundering, whose gaze frays the boundary between waking and death."),
		],
		links: [
			{ source: "vaelmyr-the-woven-realms", target: "solivane-the-dawnfather" },
			{ source: "vaelmyr-the-woven-realms", target: "nyrrha-the-tidequeen" },
			{ source: "vaelmyr-the-woven-realms", target: "the-first-song" },
			{ source: "vaelmyr-the-woven-realms", target: "the-sundering" },
			{ source: "the-first-song", target: "the-sundering" },
			{ source: "morvael-the-hollow", target: "the-sundering" },
			{ source: "morvael-the-hollow", target: "solivane-the-dawnfather" },
			{ source: "solivane-the-dawnfather", target: "the-sunspire" },
			{ source: "nyrrha-the-tidequeen", target: "the-drowned-vault" },
			{ source: "solivane-the-dawnfather", target: "nyrrha-the-tidequeen" },
			{ source: "the-heartflame-shard", target: "solivane-the-dawnfather" },
			{ source: "kaeloran-the-ashbound", target: "the-heartflame-shard" },
			{ source: "kaeloran-the-ashbound", target: "the-emberkin-order" },
			{ source: "the-emberkin-order", target: "emberhold" },
			{ source: "the-veil-serpent", target: "the-drowned-vault" },
			{ source: "morvael-the-hollow", target: "the-veil-serpent" },
			{ source: "kaeloran-the-ashbound", target: "the-veil-serpent" },
			{ source: "nyrrha-the-tidequeen", target: "kaeloran-the-ashbound" },
		],
	},
	{
		key: "noir-mystery",
		name: "Noir Mystery",
		emoji: "🕵️",
		description:
			"A rain-soaked detective story bible where every neon sign hides a secret and everyone lies.",
		nodes: [
			w("ashfall-nights", "Ashfall Nights", "hub", "A perpetually rain-drowned city of flickering neon and cheap gin, where the fog swallows screams and every alley keeps a secret."),
			w("cole-ravenna", "Detective Cole Ravenna", "character", "A disbarred cop turned private eye who chases the truth through a bottle and a curl of cigarette smoke."),
			w("vivian-marsh", "Vivian Marsh, The Nightingale", "character", "The torch singer whose voice owned the city until she was found cold on the pier, one glove missing."),
			w("silas-mercer", "Silas 'Sax' Mercer", "character", "The silver-tongued club owner who lends money with a smile and collects debts with a switchblade."),
			w("delphine-cross", "Delphine Cross", "character", "A widow draped in mourning black and diamonds who hires the detective while hiding what she already knows."),
			w("benny-doyle", "Benny 'The Ledger' Doyle", "character", "A trembling bookkeeper who knows exactly whose money is dirty and is terrified of everyone who might ask."),
			w("the-blue-canary", "The Blue Canary Club", "location", "A basement jazz joint thick with smoke and lies, where the music never stops and the deals never end."),
			w("harbor-district", "The Harbor District", "location", "A maze of fog-choked docks and rotting warehouses where bodies wash up and no one remembers seeing a thing."),
			w("the-ashen-hand", "The Ashen Hand", "faction", "A faceless syndicate that owns half the badges in the city and buries the other half in the bay."),
			w("the-midnight-murder", "The Midnight Murder", "event", "The rain-washed killing on the pier that unravels a decade of buried favors, blackmail, and betrayal."),
			w("silver-cigarette-case", "The Silver Cigarette Case", "item", "An engraved case dropped at the scene, its initials belonging to a man who swears he was nowhere near the water."),
			w("the-torn-photograph", "The Torn Photograph", "item", "Half a snapshot showing two lovers, the other half deliberately ripped away to hide a face someone would kill for."),
			w("the-crimson-code", "The Crimson Ledger Code", "lore", "A cipher of red ink hidden in the bookkeeper's accounts that names every soul the syndicate has ever bought."),
		],
		links: [
			{ source: "ashfall-nights", target: "cole-ravenna" },
			{ source: "ashfall-nights", target: "the-midnight-murder" },
			{ source: "ashfall-nights", target: "the-ashen-hand" },
			{ source: "ashfall-nights", target: "the-blue-canary" },
			{ source: "ashfall-nights", target: "harbor-district" },
			{ source: "cole-ravenna", target: "the-midnight-murder" },
			{ source: "cole-ravenna", target: "delphine-cross" },
			{ source: "cole-ravenna", target: "silver-cigarette-case" },
			{ source: "vivian-marsh", target: "the-midnight-murder" },
			{ source: "vivian-marsh", target: "the-blue-canary" },
			{ source: "delphine-cross", target: "vivian-marsh" },
			{ source: "delphine-cross", target: "the-torn-photograph" },
			{ source: "silas-mercer", target: "the-blue-canary" },
			{ source: "silas-mercer", target: "the-ashen-hand" },
			{ source: "silas-mercer", target: "silver-cigarette-case" },
			{ source: "benny-doyle", target: "the-crimson-code" },
			{ source: "benny-doyle", target: "the-ashen-hand" },
			{ source: "the-midnight-murder", target: "harbor-district" },
			{ source: "the-crimson-code", target: "the-ashen-hand" },
			{ source: "the-torn-photograph", target: "vivian-marsh" },
		],
	},
	{
		key: "ttrpg-campaign",
		name: "The Emberfall Saga",
		emoji: "🐉",
		description:
			"A dark-fantasy tabletop campaign where a ragtag party races a fallen paladin to stop a world-unmaking ritual.",
		nodes: [
			w("the-emberfall-saga", "The Emberfall Saga", "hub", "A dark-fantasy campaign in which the last embers of a dying age must be guarded before an old sin reignites into ruin."),
			w("kaeloth-the-fallen", "Kaeloth the Fallen", "character", "Once the realm's most radiant paladin, now a hollow lich-king who believes only unmaking the world can absolve his ancient guilt."),
			w("mira-stormquill", "Mira Stormquill", "character", "A quick-tongued wild sorcerer whose lightning outpaces her caution, sworn to prove her gutter-born magic can matter."),
			w("bran-oakenshield", "Bran Oakenshield", "character", "A grizzled dwarven shield-bearer who traded his order's honor for the party's survival and hasn't stopped brooding about it."),
			w("thornvale-city", "Thornvale, the Bramble City", "location", "A rain-slick trade capital of crooked spires and thorn-choked walls where every alliance is bought and every secret has a price."),
			w("the-sunken-cathedral", "The Sunken Cathedral", "location", "A drowned house of a forgotten god, its flooded nave humming with the ritual that could tear the world's seams apart."),
			w("the-iron-covenant", "The Iron Covenant", "faction", "A dwindling knightly order of oath-bound zealots who hunt the undead and distrust anyone who wields power they cannot bless."),
			w("the-ashen-hand", "The Ashen Hand", "faction", "A cult of grief-maddened acolytes who feed Kaeloth's ambition, trading their names for the promise of a painless oblivion."),
			w("the-rite-of-unmaking", "The Rite of Unmaking", "event", "The world-ending ritual Kaeloth is assembling piece by piece, each verse of it pulling reality one thread closer to nothing."),
			w("the-sunspear", "The Sunspear", "item", "A lance of caged dawnlight, the one weapon whose fire can still wound a soul as cold and old as Kaeloth's."),
			w("crown-of-hollow-kings", "Crown of the Hollow Kings", "item", "A blackened diadem that grants dominion over the dead while quietly hollowing out whoever dares to wear it."),
			w("the-gravebound-wyrm", "The Gravebound Wyrm", "creature", "A skeletal dragon chained to the cathedral's depths, its every breath a gale of grave-dust that ages the living to bone."),
			w("the-first-shattering", "The First Shattering", "lore", "The buried truth that Kaeloth once broke the world to save it, birthing both the Crown and the guilt that now drives his revenge."),
		],
		links: [
			{ source: "the-emberfall-saga", target: "kaeloth-the-fallen" },
			{ source: "the-emberfall-saga", target: "mira-stormquill" },
			{ source: "the-emberfall-saga", target: "bran-oakenshield" },
			{ source: "the-emberfall-saga", target: "thornvale-city" },
			{ source: "the-emberfall-saga", target: "the-rite-of-unmaking" },
			{ source: "kaeloth-the-fallen", target: "the-ashen-hand" },
			{ source: "kaeloth-the-fallen", target: "crown-of-hollow-kings" },
			{ source: "kaeloth-the-fallen", target: "the-gravebound-wyrm" },
			{ source: "the-ashen-hand", target: "the-rite-of-unmaking" },
			{ source: "the-rite-of-unmaking", target: "the-sunken-cathedral" },
			{ source: "the-gravebound-wyrm", target: "the-sunken-cathedral" },
			{ source: "mira-stormquill", target: "the-sunspear" },
			{ source: "the-sunspear", target: "kaeloth-the-fallen" },
			{ source: "bran-oakenshield", target: "the-iron-covenant" },
			{ source: "the-iron-covenant", target: "the-ashen-hand" },
			{ source: "the-iron-covenant", target: "thornvale-city" },
			{ source: "mira-stormquill", target: "thornvale-city" },
			{ source: "crown-of-hollow-kings", target: "the-rite-of-unmaking" },
			{ source: "the-first-shattering", target: "crown-of-hollow-kings" },
			{ source: "the-first-shattering", target: "kaeloth-the-fallen" },
		],
	},
]

export function getTemplate(key: string): Template | undefined {
	return TEMPLATES.find((t) => t.key === key)
}
