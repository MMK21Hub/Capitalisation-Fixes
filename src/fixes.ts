import Fix from "./classes/Fix.js"
import { fixGroup, autoCapitaliseGroup, multiFixGroup } from "./fixGroups.js"
import { getMilk } from "./helpers/languageHelpers.js"
import { lang } from "./helpers/minecraftHelpers.js"
import {
  CapitaliseFromTranslationStringsTransformer,
  CapitaliseSegmentTransformer,
  OverrideTransformer,
  PluralGuardTransformer,
  RemoveWordTransformer,
  ReplaceTransformer,
  TitleCaseTransformer,
} from "./transformers/index.js"

const autoCapitaliser = new CapitaliseFromTranslationStringsTransformer({
  vanillaStrings: ["block.**", "item.**", "entity.**"],
})

/** If there's a letter right at the end of a string, add a full stop to the end */
const addFullStop = new ReplaceTransformer(/\w$/, "$&.")

/** Replaces right single quotation marks (’) with apostrophes (') */
const standardiseQuoteMarks = new ReplaceTransformer("\u2019", "'")

const fixes: Fix[] = [
  new Fix({
    bug: "MC-250158",
    key: "advancements.adventure.avoid_vibration.description",
    // Adds a serial comma to the list of blocks/mobs that can detect player vibrations
    transformer: new ReplaceTransformer(" or", ", or"),
  }),
  new Fix({
    bug: "MC-236606",
    key: "options.hideLightningFlashes.tooltip",
    transformer: autoCapitaliser,
    versions: ["21w37a", "1.20-pre1"],
  }),
  ...multiFixGroup(
    "MC-219541",
    new CapitaliseSegmentTransformer(lang`${"attribute.name.generic.armor"}`),
    [
      "subtitles.entity.horse.armor",
      "subtitles.item.armor.equip_chain",
      "subtitles.item.armor.equip_diamond",
      "subtitles.item.armor.equip_gold",
      "subtitles.item.armor.equip_iron",
      "subtitles.item.armor.equip_leather",
      "subtitles.item.armor.equip_netherite",
    ]
  ),
  new Fix({
    bug: "MC-195781",
    key: "structure_block.include_entities",
    transformer: new TitleCaseTransformer(),
    versions: [null, "1.20-pre1"],
  }),
  new Fix({
    bug: "MC-258461",
    key: "structure_block.detect_size",
    transformer: new TitleCaseTransformer(),
    versions: [null, "1.20-pre2"],
  }),
  ...fixGroup(
    "MC-195780",
    {
      "structure_block.mode_info.load": new TitleCaseTransformer(),
      "structure_block.mode_info.data": new TitleCaseTransformer(),
    },
    {
      versions: [null, "22w44a"],
    }
  ),
  new Fix({
    bug: "MC-220096",
    key: "options.graphics.warning.cancel",
    transformer: new TitleCaseTransformer(),
    versions: [null, "1.20-pre2"],
  }),
  new Fix({
    bug: "MC-220096",
    key: "options.graphics.warning.accept",
    transformer: new TitleCaseTransformer(),
    versions: [null, "1.20-pre2"],
  }),
  ...fixGroup(
    "MC-128972",
    {
      "distance.description": "Distance to entities",
      "level.description": "Players with experience level",
      "gamemode.description": "Players in gamemode",
      "name.description": "Entities with name",
      "x.description": "X coordinate",
      "y.description": "Y coordinate",
      "z.description": "Z coordinate",
    },
    { keyPrefix: "argument.entity.options" }
  ),
  new Fix({
    bug: "MC-206779",
    key: "subtitles.block.honey_block.slide",
    transformer: autoCapitaliser,
  }),
  new Fix({
    bug: "MC-237590",
    key: "options.chunks",
    transformer: new TitleCaseTransformer(),
  }),
  ...autoCapitaliseGroup(
    "MC-206548",
    ["subtitles.entity.leash_knot.break", "subtitles.entity.leash_knot.place"],
    {
      versions: [null, "1.20-pre1"],
    }
  ),
  new Fix({
    bug: "MC-244721",
    key: "selectWorld.backupEraseCache",
    transformer: new TitleCaseTransformer(),
    versions: [null, "22w44a"],
  }),
  new Fix({
    bug: "MC-222876",
    key: "createWorld.customize.buffet.title",
    transformer: new TitleCaseTransformer(),
    versions: [null, "25w02a"],
  }),
  ...autoCapitaliseGroup(
    "MC-219533",
    [
      "subtitles.entity.wandering_trader.drink_milk",
      "subtitles.entity.wandering_trader.drink_potion",
    ],
    {
      // There isn't a translation string for "Milk" on its own,
      // so we extract it from other strings and manually add it
      // to the list of strings to capitalise
      alwaysCapitalise: [getMilk()],
    }
  ),
  new Fix({
    bug: "MC-249980",
    key: "advancements.husbandry.allay_deliver_cake_to_note_block.description",
    transformer: autoCapitaliser,
    versions: ["22w14a", "1.19-pre1"],
  }),
  new Fix({
    bug: "MC-226454",
    key: "advancements.adventure.walk_on_powder_snow_with_leather_boots.description",
    // Replaces "XXX...YYY" with "XXX... YYY" (i.e. adds a space after the ellipsis)
    transformer: new ReplaceTransformer(/(\w)\.\.\.(\w)/, "$1... $2"),
    versions: ["1.17-pre1", "1.20-pre1"],
  }),
  ...autoCapitaliseGroup(
    "MC-250932",
    ["subtitles.entity.goat.horn_break", "subtitles.item.goat_horn.play"],
    { versions: ["22w17a", "1.19-pre1"] }
  ),
  new Fix({
    bug: "MC-250968",
    key: "subtitles.entity.goat.horn_break",
    transformer: new ReplaceTransformer(lang("entity.minecraft.goat"), "$&'s"),
    languages: ["en_us"],
    versions: ["22w17a", null],
  }),
  ...multiFixGroup(
    "MC-226484",
    new ReplaceTransformer(/a Copper block/i, "copper"),
    [
      "advancements.husbandry.wax_on.description",
      "advancements.husbandry.wax_off.description",
    ]
  ),
  new Fix({
    bug: "MC-252408",
    key: "chat.disabled.profile",
    transformer: addFullStop,
    languages: ["en_us"],
    versions: ["1.19-pre5", "1.20-pre2"],
  }),
  new Fix({
    bug: "MC-253178",
    key: "gui.abuseReport.reason.non_consensual_intimate_imagery",
    transformer: new ReplaceTransformer("consentual", "consensual"), // cspell:disable-line
    languages: ["en_us"],
    versions: ["22w24a", "1.19.1-pre1"],
  }),
  new Fix({
    bug: "MC-253183",
    key: "gui.chatSelection.fold",
    transformer: new ReplaceTransformer(
      /^(.+)(Unrelated)(.*)/,
      (_, groups) => groups[0] + groups[1].toLowerCase() + groups[2]
    ),
    languages: ["en_us"],
    versions: ["22w24a", "1.19.1-pre1"],
  }),
  new Fix({
    bug: "MC-253223",
    key: "gui.abuseReport.reason.terrorism_or_violent_extremism.description",
    transformer: new RemoveWordTransformer(/with/, {
      matchBefore: /threatening/,
      matchAfter: /acts/,
    }),
    versions: ["22w24a", "1.19.1-rc1"],
  }),
  new Fix({
    bug: "MC-253102",
    key: "gui.chatReport.selected_chat",
    transformer: new ReplaceTransformer("Messages", "Message(s)"),
    versions: ["22w24a", "1.19.1-pre1"],
  }),
  new Fix({
    bug: "MC-253182",
    key: "gui.abuseReport.reason.self_harm_or_suicide.description",
    // Correct translation string provided by a Mojang employee: https://bugs.mojang.com/browse/MC-253182?focusedCommentId=1175803&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-1175803
    // Change is too complex to express with transformers, so I've just used an OverrideTransformer for this one
    transformer: new OverrideTransformer(
      "Someone is talking about or threatening to harm themselves in real life."
    ),
    versions: ["22w24a", "1.19.1-pre3"],
  }),
  ...multiFixGroup(
    "MC-256424",
    new ReplaceTransformer(/gamemode/i, "game mode"),
    [
      "debug.creative_spectator.help",
      "debug.creative_spectator.error",
      "argument.entity.options.gamemode.description",
    ],
    {
      versions: [null, "1.20-pre1"],
    }
  ),
  new Fix({
    bug: "MC-250197",
    key: "advancements.husbandry.safely_harvest_honey.description",
    transformer: new ReplaceTransformer(
      "Bottle",
      lang("item.minecraft.glass_bottle")
    ),
    versions: [null, "1.20-pre2"],
  }),
  new Fix({
    bug: "MC-257618",
    key: "telemetry.event.world_loaded.description",
    transformer: new ReplaceTransformer(/\bpair\b/, "paired"),
    versions: ["22w46a", "1.19.3-pre1"],
  }),
  new Fix({
    bug: "MC-258246",
    key: "options.telemetry",
    // Adds an ellipsis ("...") to the end of the string
    transformer: new ReplaceTransformer(/$/, "..."),
    versions: ["22w46a", "23w03a"],
  }),
  ...multiFixGroup(
    "MC-203095",
    new PluralGuardTransformer(/\bpoints\b/i),
    [
      "query.points",
      "set.points.success.single",
      "set.points.success.multiple",
      "add.points.success.single",
      "add.points.success.multiple",
    ],
    {
      keyPrefix: "commands.experience",
    }
  ),
  ...multiFixGroup(
    "MC-203095",
    new PluralGuardTransformer(/\blevels\b/i),
    [
      "query.levels",
      "set.levels.success.single",
      "set.levels.success.multiple",
      "add.levels.success.single",
      "add.levels.success.multiple",
    ],
    {
      keyPrefix: "commands.experience",
    }
  ),
  ...multiFixGroup(
    "MC-256422",
    standardiseQuoteMarks,
    [
      "gui.chatReport.report_sent_msg",
      "gui.banned.description.temporary",
      "gui.banned.description.permanent",
    ],
    {
      versions: [null, "24w33a"],
    }
  ),
  ...multiFixGroup(
    "MC-256422",
    standardiseQuoteMarks,
    ["mco.account.privacyinfo", "telemetry.event.world_load_times.description"],
    {
      versions: ["22w46a", "24w33a"],
    }
  ),
  new Fix({
    bug: "MC-256422",
    key: "mco.account.privacy.information",
    transformer: standardiseQuoteMarks,
    versions: ["23w42a", "24w33a"],
  }),
  new Fix({
    bug: "MC-256422",
    key: "gui.abuseReport.report_sent_msg",
    transformer: standardiseQuoteMarks,
    versions: ["23w33a", "24w33a"],
  }),
  new Fix({
    bug: "MC-259360",
    key: "selectWorld.mapFeatures.info",
    transformer: new ReplaceTransformer("Shipwrecks etc", "Shipwrecks, etc"),
    versions: ["23w04a", "23w06a"],
  }),
  ...multiFixGroup(
    "MC-264962",
    new ReplaceTransformer("%1$s+%2$s", "%1$s + %2$s"),
    ["inventory.hotbarInfo", "inventory.hotbarSaved"]
  ),
  new Fix({
    bug: "MC-264962",
    key: "options.accessibility.narrator_hotkey.tooltip",
    transformer: new ReplaceTransformer("'Ctrl+B'", "Ctrl + B"),
    versions: ["23w33a", null],
  }),
  // Unable to reproduce the bug in-game, for now
  // ...multiFixGroup(
  //   "MC-188265",
  //   new ReplaceTransformer("blocks away", "block(s) away"),
  //   [
  //     "commands.locate.biome.success",
  //     "commands.locate.poi.success",
  //     "commands.locate.structure.success",
  //   ]
  // ),
  ...fixGroup("MC-158539", {
    "item.minecraft.tipped_arrow.effect.awkward": "Awkward Tipped Arrow",
    "item.minecraft.tipped_arrow.effect.mundane": "Mundane Tipped Arrow",
    "item.minecraft.tipped_arrow.effect.thick": "Thick Tipped Arrow",
  }),
  new Fix({
    bug: "MC-250194",
    key: "advancements.husbandry.complete_catalogue.title",
    transformer: new ReplaceTransformer("Catalogue", "Catalog"),
    languages: ["en_us"],
  }),
  ...multiFixGroup("MC-189953", new ReplaceTransformer("Win", "Super"), [
    "key.keyboard.left.win",
    "key.keyboard.right.win",
  ]),
  ...autoCapitaliseGroup(
    "MC-250153",
    // We only fix the corrections marked in green on the bug report table,
    // because those are the ones we know are intended by Mojang
    [
      "advancements.adventure.arbalistic.description",
      "advancements.adventure.hero_of_the_village.description",
      "advancements.adventure.summon_iron_golem.description",
      "advancements.adventure.voluntary_exile.description",
      "advancements.husbandry.fishy_business.description",
      "advancements.husbandry.plant_seed.description",
      "advancements.nether.distract_piglin.description",
      "advancements.story.lava_bucket.description",
      "advancements.story.mine_diamond.description",
      "advancements.story.obtain_armor.description",
      // Wax On and Wax Off are excluded because of MC-226484
      // "advancements.husbandry.wax_on.description",
      // "advancements.husbandry.wax_off.description",
      "advancements.husbandry.make_a_sign_glow.description",
    ],
    {
      alwaysCapitalise: [
        "Village",
        "Raid",
        "Fish",
        "Seed",
        "Gold",
        "Iron",
        "Copper Block",
      ],
    }
  ),
]

export default fixes
