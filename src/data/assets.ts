/*
  Slug to image mapping. Source: 11-visuals-and-assets.md.

  Every entry is written out from that file's tables rather than derived from a
  filename, because the analysis filenames do not match their slugs and two
  essay files carry a -v2 suffix the slug does not. Deriving would work for some
  and silently fail for others.

  Images are imported so Astro processes them: responsive sets, modern formats,
  and explicit intrinsic dimensions, which is what keeps CLS at zero.

  `Never Split the Difference.jpg` is deliberately absent. Its review file is
  empty and the entry does not ship: twenty three entries, twenty three covers.
*/

import type { ImageMetadata } from 'astro';

/* ---- Essay thumbnails, seven. Filenames match slugs except two -v2. ---- */
import aGuideToChangingOneThing from '../assets/essays/a-guide-to-changing-one-thing.png';
import iQuitEverySystem from '../assets/essays/i-quit-every-system-i-ever-loved-v2.png';
import lookWhereYouWantToGo from '../assets/essays/look-where-you-want-to-go.png';
import nobodyIsBoring from '../assets/essays/nobody-is-boring-your-questions-are.png';
import sharpenLess from '../assets/essays/sharpen-less-v2.png';
import theBadVersionGoesFirst from '../assets/essays/the-bad-version-goes-first.png';
import whyYouRememberNothing from '../assets/essays/why-you-remember-nothing-you-learned-from-a-tutorial.png';

/* ---- Analysis thumbnails, eight. Filenames do not match slugs. ---- */
import agenticPlanning from '../assets/analysis/Agentic Planning.jpg';
import physicalAI from '../assets/analysis/Physical AI.jpg';
import landedCostHedging from '../assets/analysis/Landed-cost Hedging.jpg';
import digitalTwins from '../assets/analysis/Digital Twins and Master Data.jpg';
import deterministicHangover from '../assets/analysis/Deterministic Hangover.jpg';
import planningBecomesDecision from '../assets/analysis/Planning becomes the decision.jpg';
import forecastingHighVolume from '../assets/analysis/Forecasting in a high-volume world.jpg';
import realTimeBullwhip from '../assets/analysis/Real-Time Bullwhip.jpg';

/* ---- Book covers, twenty three. ---- */
import atomicHabits from '../assets/covers/Atomic Habits.jpg';
import deepWork from '../assets/covers/Deep Work.jpg';
import gettingThingsDone from '../assets/covers/Getting Things Done.jpg';
import howToTalkToAnyone from '../assets/covers/How To Talk To Anyone.jpg';
import influence from '../assets/covers/Influence.jpg';
import mindwise from '../assets/covers/Mindwise.jpg';
import pokeTheBox from '../assets/covers/Poke the Box.jpg';
import presuasion from '../assets/covers/Presuasion.jpg';
import skinInTheGame from '../assets/covers/Skin in the Game.jpg';
import soGoodTheyCantIgnoreYou from "../assets/covers/So Good They Can't Ignore You.jpg";
import stealLikeAnArtist from '../assets/covers/Steal Like an Artist.jpg';
import the4HourWorkweek from '../assets/covers/The 4-Hour Workweek.jpg';
import theArtOfProfitability from '../assets/covers/The Art of Profitability.jpg';
import theCourageToBeDisliked from '../assets/covers/The Courage to be Disliked.jpg';
import theEMythRevisited from '../assets/covers/The E Myth Revisited.jpg';
import thePersonalMBA from '../assets/covers/The Personal MBA.jpg';
import thePractice from '../assets/covers/The Practice.jpg';
import thePsychologyOfMoney from '../assets/covers/The Psychology of Money.jpg';
import theUltimateSalesMachine from '../assets/covers/The Ultimate Sales Machine.jpg';
import theWarOfArt from '../assets/covers/The War of Art.jpg';
import thisIsMarketing from '../assets/covers/This is Marketing.jpg';
import youCanNegotiateAnything from '../assets/covers/You Can Negotiate Anything.jpg';
import zeroToOne from '../assets/covers/Zero to One.jpg';

/* ---- About page images, seven. Note the .JPG and .jpeg extensions. ---- */
import professionalHeadshot from '../assets/about/Professional Headshot.jpg';
import funGradPhoto from '../assets/about/Fun Grad Photo.jpeg';
/* The source is Fun Image.JPG. Astro's image type map does not include the
   uppercase extension, so the repo copy is normalised to .jpg. The original in
   the vault is untouched. Reported. */
import funImage from '../assets/about/Fun Image.jpg';
import lucidDealership from '../assets/about/Lucid Dealership.jpg';
import newGradHeadshot from '../assets/about/New Grad Headshot.png';
import packagingPhoto from '../assets/about/Packaging Photo.png';
/* The source is Dog Image.JPG; the repo copy is normalised to .jpg for the
   same reason Fun Image was. The original in the vault is untouched. */
import dogImage from '../assets/about/Dog Image.jpg';

/* ---- Project tile marks, 11. Both supplied monochrome with a transparent
       background, so neither needs desaturating. ---- */
import carSketch from '../assets/glyphs/Car Sketch.png';
import recycleIcon from '../assets/glyphs/Recycle Icon.png';

/* ---- Hero. Placeholder per 11: an AI montage where the direction asks for a
       single subject photograph. ---- */
import heroImage from '../assets/hero/Hero Image.png';

export const ESSAY_THUMBS: Record<string, ImageMetadata> = {
  'a-guide-to-changing-one-thing': aGuideToChangingOneThing,
  'i-quit-every-system-i-ever-loved': iQuitEverySystem,
  'look-where-you-want-to-go': lookWhereYouWantToGo,
  'nobody-is-boring-your-questions-are': nobodyIsBoring,
  'sharpen-less': sharpenLess,
  'the-bad-version-goes-first': theBadVersionGoesFirst,
  'why-you-remember-nothing-you-learned-from-a-tutorial': whyYouRememberNothing,
};

export const ANALYSIS_THUMBS: Record<string, ImageMetadata> = {
  'agentic-planning-supervision': agenticPlanning,
  'physical-ai-planning-signal': physicalAI,
  'landed-cost-hedging': landedCostHedging,
  'digital-twin-master-data': digitalTwins,
  'deterministic-hangover': deterministicHangover,
  'planning-becomes-the-decision': planningBecomesDecision,
  'forecasting-high-volume-world': forecastingHighVolume,
  'bullwhip-real-time': realTimeBullwhip,
};

export const COVERS: Record<string, ImageMetadata> = {
  'atomic-habits': atomicHabits,
  'deep-work': deepWork,
  'getting-things-done': gettingThingsDone,
  'how-to-talk-to-anyone': howToTalkToAnyone,
  influence: influence,
  mindwise: mindwise,
  'poke-the-box': pokeTheBox,
  presuasion: presuasion,
  'skin-in-the-game': skinInTheGame,
  'so-good-they-cant-ignore-you': soGoodTheyCantIgnoreYou,
  'steal-like-an-artist': stealLikeAnArtist,
  'the-4-hour-workweek': the4HourWorkweek,
  'the-art-of-profitability': theArtOfProfitability,
  'the-courage-to-be-disliked': theCourageToBeDisliked,
  'the-e-myth-revisited': theEMythRevisited,
  'the-personal-mba': thePersonalMBA,
  'the-practice': thePractice,
  'the-psychology-of-money': thePsychologyOfMoney,
  'the-ultimate-sales-machine': theUltimateSalesMachine,
  'the-war-of-art': theWarOfArt,
  'this-is-marketing': thisIsMarketing,
  'you-can-negotiate-anything': youCanNegotiateAnything,
  'zero-to-one': zeroToOne,
};

export const ABOUT_IMAGES = {
  professionalHeadshot,
  funGradPhoto,
  funImage,
  lucidDealership,
  newGradHeadshot,
  packagingPhoto,
  dogImage,
};

export const HERO_IMAGE = heroImage;

export const TILE_MARKS = { car: carSketch, recycle: recycleIcon };

/*
  Thumbnail lookup across both written collections. Returns null when a slug has
  no image, so a card can ship without one and the omission can be reported.
  11: no placeholder image is ever generated.
*/
export const thumbFor = (collection: 'writing' | 'analysis', slug: string): ImageMetadata | null =>
  (collection === 'writing' ? ESSAY_THUMBS[slug] : ANALYSIS_THUMBS[slug]) ?? null;

export const coverFor = (slug: string): ImageMetadata | null => COVERS[slug] ?? null;
