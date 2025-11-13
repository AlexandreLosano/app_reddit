const mysql = require('mysql2/promise');

// Lista de subreddits para inserir
const subreddits = [
  '19thCenturyPorn',
  '40plusGoneWild',
  '90sFitnessPhotos',
  '90sTits',
  'AdorableNudes',
  'all',
  'amateurcumsluts',
  'amateur_milfs',
  'AmateurPorn',
  'anal',
  'areolas',
  'AreolasFans',
  'AreolasGW',
  'Artistic_Hentai',
  'ArtisticNsfwDrawings',
  'ArtsyCreativeNudes',
  'AsianSoftporn',
  'BeautifulAndNaked',
  'BEAUTIFULPUSSY',
  'bigareolas',
  'BigDarkAreolas_',
  'BigTitsButClothed',
  'BlowJob',
  'BlowjobGirls',
  'braless',
  'BreedingMaterial',
  'Brunette_Vixens',
  'ButtholeSpokes',
  'ButtsAndBareFeet',
  'CartoonDrawnMILFS',
  'CartoonNudity',
  'CartoonPorn',
  'ChangingRooms',
  'chubby',
  'CosplayPornVideos',
  'creampie',
  'creampiegifs',
  'Creampie_Porn',
  'Dark_nipples',
  'DCNSFW',
  'Disney_NSFW',
  'EgirlFeet',
  'EliteBlowjob',
  'EngorgedVeinyBreasts',
  'EroticArt',
  'Exhibitionistfun',
  'ExhibitionistGirl',
  'Facial_and_Feet',
  'FarmMergeValley',
  'FeetAdmirers',
  'FeetAny',
  'FeetDomination',
  'FeetFetishism',
  'feetfootpics',
  'FeetInYourFace',
  'FeetPics100',
  'FeetPicsGallery',
  'Feet_Queens',
  'FemboyCum',
  'FemBoys',
  'Femcock',
  'Fingering',
  'FingeringPorn',
  'FittingRoomNsfw',
  'Flashing',
  'FlashingAndFlaunting',
  'FlashingGirls',
  'flashingmilfs',
  'footdomination_',
  'Foot_Feet_Toes_Fetish',
  'FootFetish',
  'Footjob',
  'FootLicking',
  'forcedcreampie',
  'GamesOnReddit',
  'girlspissingg',
  'GirlsShowering',
  'GlamourIncorporated',
  'GlamourModel',
  'GlamourPhotos',
  'Glamour_Pinup',
  'GloryHoley',
  'GodPussy',
  'gonewild30plus',
  'gwpublic',
  'Hairy',
  'HairyCurvy',
  'HairyPussy',
  'hairywomenaresexy',
  'Handjob',
  'holdthemoan',
  'HotAndCold',
  'HotMoms',
  'IncestClub',
  'JapaneseHotties',
  'JapanTits',
  'JumpCat',
  'KinkyAdultMarketplace',
  'LactatingMoms',
  'LactationFixation',
  'LactationGW',
  'laracroftNSFW',
  'largemilkers',
  'legs',
  'LegsSFW',
  'Legs_up',
  'LegsUpPantsDown',
  'Lesbian_gifs',
  'lesbians',
  'lingerie',
  'LingerieGW',
  'LingerieNoir',
  'LongNipples',
  'MarvelLesbians',
  'MarvelNSFW',
  'maturemilf',
  'metart',
  'Midget_Club',
  'MidgetsDoingPorn',
  'Midget_Tanya_Fan',
  'midgetXXXX',
  'milf',
  'milfcumsluts',
  'MirrorSelfie',
  'Mirror_spread',
  'MomSonIncest',
  'Naturalgirlfeet',
  'ninigrams',
  'Nipples',
  'Nonchalant_Pee',
  'NostalgiaFapping',
  'nsfw',
  'NSFWart',
  'NSFW_Japan',
  'Nudes',
  'Nude_Selfie',
  'NylonFeetLove',
  'OldenPorn',
  'OnlyFansFootLovers',
  'OnOff',
  'OpeningLegs',
  'OutdoorRecreation',
  'OvalNipples',
  'Pee',
  'PeeKink',
  'Pinup_Art',
  'PissingPeeingPorn',
  'Playboy',
  'popular',
  'pornclassics',
  'PornVintageClassic',
  'PovRide',
  'PreggoPorn',
  'PregnantDream',
  'pregnantgonewild',
  'pregnantporn',
  'prostatemassage',
  'prostatepleasure',
  'prostatepleasures',
  'public',
  'PublicFlashing',
  'PUBLICNUDITY',
  'pussy',
  'PussyFlashing',
  'Pussy_Perfection',
  'RealGirls',
  'RealPublicNudity',
  'retropornstars',
  'rule34',
  'Rule_34',
  'Rule34LoL',
  'SensualFingers',
  'Sexy',
  'sexy_angels',
  'SexyButClothed',
  'Sfw',
  'SFW_Rule34',
  'ShakingBoobs',
  'ShemaleCumWhileFucked',
  'Shemales',
  'ShemalesParadise',
  'shirtbiting',
  'socksgonewild',
  'softcore',
  'SouthFacingNipples',
  'stripgirls',
  'superheroporn',
  'TelegramGirls_Nsfw',
  'TGirl_Feet',
  'TGirlsgettinghard',
  'TGirlTemple',
  'tits',
  'TITTIESandJEANS',
  'Titty_pics',
  'ToeSucking',
  'TransCumQueens',
  'TransFeet',
  'transporn',
  'upherbutt',
  'VerifiedFeet',
  'VintageBabes',
  'VoyeurFlash',
  'VSCOgirlFeet',
  'workgonewild',
  'YourEverydayHouseWife'
];

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'reddit_user',
  password: process.env.DB_PASSWORD || 'reddit_pass',
  database: process.env.DB_NAME || 'reddit_viewer'
};

async function insertSubreddits() {
  let connection;

  try {
    console.log('🔌 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao MySQL!\n');

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    console.log(`📝 Inserindo ${subreddits.length} subreddits...\n`);

    for (const subreddit of subreddits) {
      try {
        await connection.execute(
          'INSERT INTO subreddits (name, visible) VALUES (?, TRUE)',
          [subreddit]
        );
        console.log(`✅ Inserido: r/${subreddit}`);
        inserted++;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Já existe: r/${subreddit}`);
          skipped++;
        } else {
          console.error(`❌ Erro ao inserir r/${subreddit}:`, error.message);
          errors++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DA INSERÇÃO:');
    console.log('='.repeat(50));
    console.log(`✅ Inseridos: ${inserted}`);
    console.log(`⚠️  Ignorados (já existiam): ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📦 Total processados: ${subreddits.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão com o banco encerrada.');
    }
  }
}

// Executar
insertSubreddits();
