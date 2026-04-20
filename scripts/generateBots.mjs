/**
 * generateBots.mjs
 * Generates 1000 bot profiles for DreamCodeApp and writes data/botProfiles.ts
 * Deterministic via seeded PRNG (mulberry32)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── Seeded PRNG (mulberry32) ───────────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(0xDEADBEEF);
const rand = () => rng();
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// ─── Name pools ─────────────────────────────────────────────────────────────
const NAMES = {
  DE: {
    f: ['Lena','Sophie','Anna','Julia','Laura','Hannah','Lea','Katharina','Lisa','Emma',
        'Sarah','Nina','Franziska','Luisa','Jana','Melanie','Claudia','Sandra','Petra','Monika',
        'Emilia','Mia','Charlotte','Nathalie','Judith'],
    m: ['Hans','Thomas','Maximilian','Felix','Jonas','Leon','Lukas','Tobias','Stefan','Andreas',
        'Michael','Christian','David','Alexander','Philipp','Sebastian','Jan','Marco','Klaus','Werner',
        'Paul','Elias','Noah','Florian','Markus'],
    nb: ['Robin','Kim','Alex','Sasha','Jamie'],
    surnames: ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann',
               'Schäfer','Koch','Bauer','Richter','Klein','Wolf','Neumann','Zimmermann','Braun','Hartmann']
  },
  GB: {
    f: ['Emma','Olivia','Charlotte','Amelia','Isla','Ava','Lily','Grace','Freya','Poppy',
        'Sophie','Alice','Chloe','Jessica','Sienna','Hannah','Ellie','Lucy','Mia','Evie',
        'Rosie','Daisy','Ruby','Millie','Abigail'],
    m: ['James','Oliver','Jack','Harry','George','Noah','Charlie','Jacob','Alfie','Freddie',
        'Oscar','Leo','Arthur','Henry','William','Ethan','Thomas','Joseph','Samuel','Liam',
        'Sebastian','Edward','Theo','Rory','Finley'],
    nb: ['Sam','Jordan','Morgan','Avery','Riley'],
    surnames: ['Smith','Jones','Williams','Taylor','Brown','Davies','Evans','Wilson','Thomas','Roberts',
               'Johnson','Lewis','Walker','Robinson','Wood','Thompson','White','Watson','Jackson','Harris']
  },
  FR: {
    f: ['Camille','Amelie','Marie','Claire','Julie','Lucie','Alice','Emma','Manon','Lea',
        'Sarah','Chloe','Ines','Margot','Charlotte','Juliette','Elise','Noemie','Pauline','Oceane',
        'Mathilde','Aurelie','Clemence','Victoire','Laure'],
    m: ['Pierre','Louis','Antoine','Hugo','Baptiste','Nicolas','Julien','Thomas','Lucas','Maxime',
        'Clement','Romain','Adrien','Xavier','Etienne','Gabriel','Florian','Quentin','Mathieu','Guillaume',
        'Alexandre','Victor','Paul','Arthur','Raphael'],
    nb: ['Camille','Alexis','Charlie','Dominique','Rene'],
    surnames: ['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau',
               'Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier']
  },
  ES: {
    f: ['Maria','Carmen','Sofia','Lucia','Laura','Marta','Paula','Elena','Isabel','Ana',
        'Cristina','Raquel','Pilar','Mercedes','Beatriz','Rosa','Teresa','Alicia','Natalia','Silvia',
        'Claudia','Irene','Nuria','Patricia','Lorena'],
    m: ['Carlos','Diego','Javier','Miguel','Antonio','Jose','Francisco','Manuel','Pedro','Alejandro',
        'Roberto','Pablo','Sergio','Alberto','Fernando','David','Ruben','Eduardo','Andres','Juan',
        'Victor','Marcos','Adrian','Ivan','Luis'],
    nb: ['Alex','Camilo','Remi','Jordan','Noa'],
    surnames: ['Garcia','Martinez','Lopez','Sanchez','Gonzalez','Perez','Rodriguez','Fernandez','Lopez','Gomez',
               'Diaz','Hernandez','Alvarez','Ruiz','Jimenez','Moreno','Muñoz','Torres','Romero','Alonso']
  },
  IT: {
    f: ['Sofia','Giulia','Valentina','Chiara','Francesca','Elena','Sara','Martina','Laura','Alice',
        'Elisa','Silvia','Roberta','Serena','Annalisa','Claudia','Federica','Daniela','Cristina','Paola',
        'Camilla','Aurora','Giada','Beatrice','Lucia'],
    m: ['Marco','Andrea','Luca','Giovanni','Francesco','Antonio','Davide','Stefano','Alessandro','Matteo',
        'Simone','Riccardo','Fabio','Lorenzo','Roberto','Giorgio','Nicola','Emanuele','Federico','Pietro',
        'Tommaso','Edoardo','Filippo','Jacopo','Giacomo'],
    nb: ['Andrea','Alex','Camille','Robin','Sasha'],
    surnames: ['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco',
               'Bruno','Gallo','Conti','De Luca','Mancini','Costa','Giordano','Rizzo','Lombardi','Moreno']
  },
  NL: {
    f: ['Emma','Sophie','Julia','Lisa','Anna','Laura','Olivia','Hannah','Sara','Fleur',
        'Manon','Roos','Noor','Anouk','Femke','Lotte','Amber','Nina','Mila','Iris'],
    m: ['Daan','Liam','Noah','Lucas','Finn','Lars','Bas','Thomas','Sander','Joris',
        'Tim','Ruben','Mark','Bram','Pieter','Jasper','Niels','Stijn','Wouter','Kevin'],
    nb: ['Sam','Alex','Robin','Jesse','Remi'],
    surnames: ['de Jong','Jansen','de Vries','van den Berg','van Dijk','Bakker','Janssen','Visser','Smit','Meijer']
  },
  SE: {
    f: ['Astrid','Ingrid','Freya','Maja','Emma','Alice','Elsa','Ebba','Wilma','Lovisa',
        'Alva','Linnea','Ida','Hanna','Sara','Klara','Vera','Isabelle','Amanda','Sofia'],
    m: ['Erik','Lars','Axel','Oskar','Liam','Lucas','Nils','Hugo','Isak','Tobias',
        'Viktor','Mattias','Jonas','Karl','Anders','Henrik','Johan','Gustav','Emil','Olof'],
    nb: ['Kim','Alex','Sam','Robin','Charlie'],
    surnames: ['Johansson','Lindqvist','Eriksson','Larsson','Nilsson','Persson','Svensson','Gustafsson','Pettersson','Andersson']
  },
  PL: {
    f: ['Anna','Maria','Katarzyna','Malgorzata','Agnieszka','Zofia','Aleksandra','Joanna','Monika','Barbara',
        'Ewa','Magdalena','Paulina','Natalia','Karolina','Beata','Patrycja','Marta','Justyna','Dorota'],
    m: ['Piotr','Krzysztof','Andrzej','Tomasz','Marcin','Marek','Jan','Jakub','Pawel','Michal',
        'Adam','Lukasz','Maciej','Wojciech','Kamil','Bartosz','Slawomir','Grzegorz','Robert','Rafal'],
    nb: ['Alex','Jordan','Sam','Robin','Kim'],
    surnames: ['Kowalski','Wozniak','Wisniewski','Wojcik','Kowalczyk','Kaminski','Lewandowski','Zielinski','Szymanski','Wieczorek']
  },
  US: {
    f: ['Emma','Olivia','Ava','Isabella','Sophia','Charlotte','Mia','Amelia','Harper','Evelyn',
        'Abigail','Emily','Elizabeth','Mila','Ella','Scarlett','Grace','Victoria','Riley','Aria',
        'Zoe','Camila','Penelope','Luna','Sofia'],
    m: ['Liam','Noah','Oliver','Elijah','William','James','Benjamin','Lucas','Henry','Alexander',
        'Mason','Ethan','Daniel','Jacob','Logan','Jackson','Sebastian','Jack','Aiden','Owen',
        'Samuel','Wyatt','John','David','Leo'],
    nb: ['Riley','Jordan','Morgan','Avery','Taylor','Quinn','Blake','Cameron','Casey','Jamie'],
    surnames: ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Taylor',
               'Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Young','Robinson','Lewis']
  },
  BR: {
    f: ['Ana','Beatriz','Camila','Fernanda','Gabriela','Juliana','Larissa','Mariana','Patricia','Renata',
        'Vanessa','Adriana','Carolina','Daniela','Isabella','Leticia','Luciana','Monica','Natalia','Paula',
        'Rafaela','Sabrina','Tatiane','Viviane','Amanda'],
    m: ['Lucas','Rafael','Gabriel','Pedro','Mateus','Gustavo','Joao','Luiz','Felipe','Bruno',
        'Thiago','Diego','Vitor','Rodrigo','Eduardo','Leandro','Caio','Arthur','Nicolas','Igor',
        'Henrique','Fernando','Alexandre','Carlos','Antonio'],
    nb: ['Alex','Sam','Remi','Jordan','Robin'],
    surnames: ['Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Ferreira','Rodrigues','Almeida',
               'Nascimento','Araujo','Gomes','Moreira','Ribeiro','Carvalho','Cardoso','Alves','Mendes','Fernandes']
  },
  MX: {
    f: ['Sofía','Valentina','Camila','Lucia','Gabriela','Fernanda','Daniela','Mariana','Alejandra','Paola',
        'Andrea','Valeria','Isabella','Natalia','Diana','Estefania','Monica','Claudia','Karla','Itzel'],
    m: ['Santiago','Mateo','Sebastián','Miguel','Alejandro','Diego','Juan','Carlos','Eduardo','Luis',
        'Ricardo','Fernando','Roberto','Javier','Mario','Raul','Ivan','Jorge','Arturo','Manuel'],
    nb: ['Alex','Sam','Jordan','Robin','Cameron'],
    surnames: ['Garcia','Hernandez','Martinez','Lopez','Gonzalez','Rodriguez','Perez','Sanchez','Ramirez','Torres',
               'Flores','Rivera','Gomez','Diaz','Reyes','Cruz','Morales','Ortiz','Gutierrez','Chavez']
  },
  JP: {
    f: ['Yuki','Sakura','Hana','Aoi','Rin','Nana','Miku','Saki','Yui','Akari',
        'Miyu','Hinata','Kotone','Riko','Noa','Arisa','Haruka','Ayaka','Misaki','Shiori',
        'Kana','Emi','Sora','Rena','Ichika'],
    m: ['Haruto','Yuto','Sota','Yuki','Hayato','Kento','Riku','Kaito','Ren','Soichiro',
        'Kenji','Takumi','Ryota','Shun','Hiroshi','Naoki','Makoto','Tatsuya','Kazuya','Daisuke',
        'Shu','Taro','Akira','Satoshi','Nobuki'],
    nb: ['Haru','Nagi','Ren','Sora','Ao'],
    surnames: ['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato',
               'Yoshida','Yamada','Sasaki','Yamaguchi','Matsumoto','Inoue','Kimura','Hayashi','Shimizu','Yamazaki']
  },
  KR: {
    f: ['Ji-yeon','Ha-eun','Seo-yeon','Ji-a','So-yeon','Ye-jin','Hye-won','Min-ji','Na-eun','Da-eun',
        'Su-jin','Eun-ji','Ji-hye','Yeon-ji','Soo-ah','Hyun-joo','Mi-rae','Bo-ra','Ah-reum','Seul-gi'],
    m: ['Min-jun','Seo-jun','Ji-ho','Do-yun','Joon-seo','Hyun-woo','Ji-woo','Seung-hyun','Tae-yang','Ki-tae',
        'Chang-wook','Dong-hyun','Young-jun','Jin-ho','Sung-min','Woo-jin','Byung-chul','Hwan','Jae-won','Kang-min'],
    nb: ['Ji','Yeon','Ha','Seo','Bin'],
    surnames: ['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim',
               'Han','Oh','Seo','Shin','Kwon','Hong','Hwang','Moon','Bae','Ryu']
  },
  IN: {
    f: ['Priya','Ananya','Divya','Shreya','Pooja','Kavya','Neha','Swati','Aditi','Meera',
        'Sonal','Riya','Nisha','Tanvi','Anjali','Mansi','Pallavi','Rekha','Sunita','Geeta',
        'Ishita','Kritika','Simran','Tanya','Aarti'],
    m: ['Aarav','Rohan','Arjun','Rahul','Vikram','Aditya','Kabir','Nikhil','Siddharth','Karan',
        'Amit','Suresh','Rajesh','Pankaj','Sandeep','Deepak','Vikas','Akash','Manish','Ravi',
        'Dhruv','Yash','Parth','Harsh','Ankit'],
    nb: ['Arya','Kiran','Sasha','Noor','Dev'],
    surnames: ['Sharma','Gupta','Verma','Singh','Kumar','Patel','Mehta','Joshi','Agarwal','Rao',
               'Nair','Reddy','Pillai','Iyer','Mishra','Tiwari','Pandey','Dubey','Shukla','Srivastava']
  },
  ID: {
    f: ['Siti','Dewi','Rina','Fitri','Indah','Ratna','Yuni','Wulan','Ayu','Putri',
        'Dian','Maya','Novi','Rini','Sri','Tuti','Ani','Linda','Hani','Nadia'],
    m: ['Budi','Ahmad','Rizki','Deni','Fajar','Agus','Hendra','Yusuf','Andi','Bagas',
        'Ferdi','Gilang','Haris','Ilham','Joko','Kurnia','Lutfi','Miko','Nanda','Oky'],
    nb: ['Arsy','Rafi','Caca','Bintang','Sari'],
    surnames: ['Santoso','Wijaya','Suharto','Pratama','Kurniawan','Rahayu','Setiawan','Purnomo','Hadiyanto','Susanto']
  },
  PH: {
    f: ['Maria','Ana','Jenny','Rose','Joy','Grace','Liza','Rica','Cristina','Maricel',
        'Rowena','Lorena','Sheila','Aileen','Beverly','Maribel','Susana','Irene','Teresita','Leonora'],
    m: ['Jose','Juan','Rolando','Eduardo','Ramon','Carlos','Roberto','Mario','Ernesto','Alfredo',
        'Rodrigo','Antonio','Vicente','Danilo','Reynaldo','Fernando','Renato','Rodel','Arnel','Jayson'],
    nb: ['Alex','Sam','Chris','Angel','Rio'],
    surnames: ['Santos','Reyes','Cruz','Bautista','Ocampo','Gonzales','Torres','Flores','Garcia','Ramos',
               'Aquino','Dela Cruz','Fernandez','Lopez','Perez','Soriano','Mendoza','Castillo','Villanueva','Mercado']
  },
  TH: {
    f: ['Nicha','Warisa','Ploy','Fah','Nong','Nui','Pim','Aom','Mild','Joy',
        'Pancake','Kwan','Mook','Bow','Gift','Nat','Pang','Tuk','Yui','Wan'],
    m: ['Somchai','Arthit','Krit','Nattapong','Worawit','Tanakorn','Pisit','Rattana','Sarawut','Mongkol',
        'Chaiwat','Ekkachai','Suchart','Piyapong','Taweesin','Somkiat','Natthawut','Wichai','Yothin','Chainat'],
    nb: ['Gim','Jeed','Maew','Toey','Nut'],
    surnames: ['Srimuang','Chandarana','Boonmee','Wiriyapong','Kaewsai','Nakprasit','Phromthong','Suphan','Tantisiri','Uthaiwan']
  },
  CN: {
    f: ['Wei','Fang','Ling','Xiu','Hong','Yan','Li','Mei','Xin','Qing',
        'Jing','Min','Hua','Zhen','Juan','Yun','Xia','Dan','Rong','Shu'],
    m: ['Wei','Lei','Tao','Gang','Jian','Peng','Hao','Chao','Bo','Yang',
        'Feng','Kai','Liang','Ming','Quan','Rui','Sheng','Tian','Xiang','Zheng'],
    nb: ['Yun','Xin','Lin','Jing','Ming'],
    surnames: ['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou',
               'Xu','Sun','Ma','Zhu','Hu','Guo','He','Gao','Lin','Luo']
  },
  VN: {
    f: ['Linh','Lan','Huong','Mai','Ngoc','Phuong','Thuy','Trang','Minh','Thu',
        'Hoa','Ha','Bich','Hien','Nhung','Oanh','Xuan','Yen','Chi','Dung'],
    m: ['Minh','Huy','Duc','Nam','Tuan','Bao','Khoa','Long','Phuc','Thai',
        'Hoang','Dat','Hung','Khanh','Son','Tan','Thanh','Trung','Vinh','Cuong'],
    nb: ['An','Bao','Chi','Ha','Kim'],
    surnames: ['Nguyen','Tran','Le','Pham','Hoang','Phan','Vu','Dang','Bui','Do',
               'Ho','Ngo','Duong','Ly','Dinh','Truong','Nguyen','Tran','Le','Pham']
  },
  TR: {
    f: ['Elif','Zeynep','Selin','Ayse','Fatma','Merve','Esra','Ozge','Neslihan','Derya',
        'Busra','Nur','Hatice','Gulsum','Yildiz','Cemre','Ilayda','Sibel','Pinar','Bahar'],
    m: ['Emre','Burak','Mert','Oguz','Serkan','Kemal','Mehmet','Ali','Hasan','Ibrahim',
        'Mustafa','Ahmet','Volkan','Tolga','Onur','Arda','Berk','Cem','Deniz','Firat'],
    nb: ['Deniz','Evren','Yagmur','Cagla','Seren'],
    surnames: ['Yilmaz','Kaya','Demir','Celik','Sahin','Yildiz','Yildirim','Ozturk','Aydin','Ozdemir',
               'Arslan','Dogan','Kilic','Aslan','Cetin','Koc','Kurt','Ozkan','Simsek','Polat']
  },
  EG: {
    f: ['Fatima','Layla','Sara','Nour','Heba','Rana','Dina','Amira','Rania','Mona',
        'Yasmine','Asmaa','Nadia','Hana','Sahar','Ghada','Eman','Dalia','Maha','Reham'],
    m: ['Ahmed','Mohamed','Omar','Khaled','Mahmoud','Hassan','Kareem','Tarek','Amr','Sherif',
        'Islam','Mostafa','Ayman','Hossam','Wael','Essam','Adel','Magdi','Nasser','Tamer'],
    nb: ['Nour','Dina','Sam','Rami','Ola'],
    surnames: ['Hassan','Mohamed','Ali','Ahmed','Ibrahim','Mahmoud','Abdel','El-Sayed','Omar','Youssef']
  },
  NG: {
    f: ['Amara','Chidinma','Adaeze','Ngozi','Blessing','Chiamaka','Ifunanya','Onyinye','Nkechi','Aisha',
        'Fatimah','Zara','Miriam','Abimbola','Adunola','Funmilayo','Kemi','Omowunmi','Titi','Yetunde'],
    m: ['Kwame','Emeka','Chukwudi','Babatunde','Segun','Tunde','Femi','Lanre','Gbenga','Yemi',
        'Chidi','Obiora','Nnamdi','Kelechi','Uche','Ifeanyichukwu','Adeola','Gbemiga','Oluseun','Rotimi'],
    nb: ['Amara','Kemi','Tolu','Dami','Ola'],
    surnames: ['Okonkwo','Adeyemi','Okafor','Bello','Ibrahim','Abubakar','Nwosu','Eze','Chukwu','Obi',
               'Adewale','Afolabi','Oluwole','Bakare','Adetokunbo','Adesanya','Fashola','Tinubu','Amaechi','Atiku']
  },
  ZA: {
    f: ['Nomvula','Thandi','Zanele','Lindiwe','Nompumelelo','Naledi','Bontle','Karabo','Lerato','Mmabatho',
        'Ayesha','Fatima','Priya','Nadia','Chloe','Ashleigh','Bianca','Chantal','Monique','Yolande'],
    m: ['Tendai','Sipho','Thabo','Mandla','Khulekani','Lungelo','Nhlanhla','Sandile','Vusi','Bongani',
        'Ahmed','Yusuf','Imran','Kyle','Ryan','Brendan','Jared','Tyrone','Warren','Shaun'],
    nb: ['Lebo','Tshepo','Lucky','Sibo','Nandi'],
    surnames: ['Dlamini','Ndlovu','Nkosi','Zulu','Khumalo','Mthembu','Mkhize','Nxumalo','Molefe','Mahlangu']
  },
  MA: {
    f: ['Fatima','Khadija','Zineb','Sanaa','Houda','Nadia','Imane','Soukaina','Hajar','Meriem',
        'Loubna','Kaoutar','Hanane','Widad','Asma','Amina','Lamia','Samira','Nawal','Siham'],
    m: ['Mohammed','Youssef','Amine','Mehdi','Karim','Bilal','Hamza','Rachid','Khalid','Omar',
        'Hassan','Tariq','Adil','Aziz','Saad','Nabil','Jamal','Redouane','Soufiane','Zakaria'],
    nb: ['Nadia','Amine','Sami','Rania','Maha'],
    surnames: ['El Idrissi','Benali','Chouaibi','El Amrani','Berrada','Tahiri','Bensouda','El Fassi','Alaoui','Chraibi']
  },
  KE: {
    f: ['Wanjiku','Njeri','Wambui','Achieng','Otieno','Moraa','Kemunto','Nyawira','Muthoni','Wanjiru',
        'Fatuma','Amina','Zainab','Grace','Faith','Joy','Mercy','Esther','Rose','Mary'],
    m: ['Kamau','Mwangi','Njoroge','Odhiambo','Otieno','Maina','Kariuki','Mutua','Ndung\'u','Kiprotich',
        'Mohamed','Abdullah','Hassan','Samuel','David','Joseph','Peter','Paul','John','Daniel'],
    nb: ['Wanjiku','Amina','Safi','Zawadi','Baraka'],
    surnames: ['Kamau','Wanjiku','Odhiambo','Mwangi','Njoroge','Otieno','Ndung\'u','Maina','Karimi','Mutua']
  },
  AU: {
    f: ['Emma','Olivia','Charlotte','Amelia','Mia','Ava','Chloe','Isabella','Isla','Sophie',
        'Grace','Ruby','Matilda','Zoe','Lily','Hannah','Ella','Lucy','Sienna','Scarlett'],
    m: ['Oliver','William','Jack','Noah','Liam','Henry','James','Thomas','Lucas','Ethan',
        'Mason','Logan','Charlie','Harry','Hugo','Alexander','George','Jackson','Lachlan','Finn'],
    nb: ['Riley','Morgan','Alex','Sam','Jordan'],
    surnames: ['Smith','Jones','Williams','Brown','Taylor','Johnson','White','Martin','Anderson','Thompson',
               'Wilson','Campbell','Lee','Robinson','Hall','Walker','Young','Allen','King','Wright']
  },
  NZ: {
    f: ['Emma','Olivia','Charlotte','Isla','Mia','Ava','Sophie','Grace','Amelia','Lily',
        'Ruby','Ella','Chloe','Isabella','Sienna','Zoe','Hannah','Lucy','Alice','Evie'],
    m: ['Oliver','Jack','James','William','Noah','Thomas','Liam','Charlie','Henry','Lucas',
        'Ethan','George','Joshua','Samuel','Benjamin','Daniel','Logan','Jayden','Cooper','Finn'],
    nb: ['Riley','Morgan','Alex','Sam','Jordan'],
    surnames: ['Smith','Jones','Taylor','Brown','Williams','Wilson','Johnson','Anderson','Thompson','Walker']
  },
  CA: {
    f: ['Emma','Olivia','Sophia','Charlotte','Chloe','Emily','Ava','Mia','Abigail','Madison',
        'Amelia','Isabella','Lily','Grace','Ella','Victoria','Sofia','Aurora','Brooklyn','Riley'],
    m: ['Liam','Noah','Oliver','Lucas','William','Benjamin','Ethan','James','Logan','Alexander',
        'Aiden','Jackson','Sebastian','Matthew','Samuel','Henry','Owen','Dylan','Nathan','Ryan'],
    nb: ['Riley','Jordan','Morgan','Taylor','Avery'],
    surnames: ['Smith','Brown','Martin','Roy','Tremblay','Lee','Wilson','Taylor','Thomas','Anderson']
  },
  CO: {
    f: ['Valentina','Sofia','Isabella','Camila','Daniela','Mariana','Natalia','Alejandra','Paola','Laura',
        'Luisa','Maria','Paula','Adriana','Ana','Diana','Catalina','Monica','Sandra','Claudia'],
    m: ['Santiago','Andres','Juan','Carlos','Daniel','David','Sebastian','Felipe','Nicolas','Miguel',
        'Diego','Luis','Eduardo','Jorge','Alejandro','Ivan','Roberto','Mario','Ricardo','Fernando'],
    nb: ['Alex','Sam','Jordan','Robin','Kim'],
    surnames: ['Garcia','Martinez','Rodriguez','Lopez','Gonzalez','Hernandez','Perez','Torres','Ramirez','Sanchez']
  },
  AR: {
    f: ['Sofia','Valentina','Camila','Lucia','Florencia','Agustina','Martina','Milagros','Abril','Julieta',
        'Ana','Paula','Natalia','Carolina','Laura','Mariela','Roxana','Claudia','Gabriela','Silvana'],
    m: ['Santiago','Matias','Nicolas','Facundo','Agustin','Juan','Diego','Lucas','Gonzalo','Rodrigo',
        'Leandro','Pablo','Martin','Fernando','Damian','Hernan','Marcos','Javier','Gaston','Maximiliano'],
    nb: ['Alex','Sam','Jordan','Robin','Kim'],
    surnames: ['Gonzalez','Rodriguez','Lopez','Garcia','Fernandez','Martinez','Perez','Gimenez','Romero','Torres']
  },
  AE: {
    f: ['Fatima','Aisha','Mariam','Sara','Noura','Shaikha','Hessa','Maryam','Latifa','Shamsa'],
    m: ['Mohammed','Ahmad','Abdullah','Sultan','Khalid','Hamdan','Saif','Rashid','Zayed','Omar'],
    nb: ['Nour','Reem','Sami','Dana','Layla'],
    surnames: ['Al Maktoum','Al Nahyan','Al Rashid','Al Mansouri','Al Hashimi','Bin Laden','Al Falasi','Al Mazrouei','Al Nuaimi','Al Shamsi']
  },
  KZ: {
    f: ['Aizat','Asel','Dinara','Gulnara','Madina','Zarina','Ainur','Dina','Gulmira','Saule',
        'Saltanat','Zhuldyz','Aruzhan','Kamila','Aigerim','Anara','Botagoz','Dana','Farida','Gaukhar'],
    m: ['Aibek','Daniyar','Erlan','Kairat','Marat','Nurlan','Serik','Timur','Yerlan','Amir',
        'Aziz','Bauyrzhan','Dauren','Dias','Erzhan','Galymzhan','Ilyas','Kuanysh','Mazhit','Nurbol'],
    nb: ['Dana','Assel','Arman','Aida','Nuri'],
    surnames: ['Akhmetov','Nazarbayev','Sultanov','Bekova','Tulegenov','Karimov','Dzhaksybekov','Massimov','Musayev','Abenov']
  },
  UZ: {
    f: ['Nilufar','Nodira','Maftuna','Feruza','Dildora','Gulnora','Nasiba','Ozoda','Shahnoza','Zulfiya'],
    m: ['Jasur','Otabek','Sanjar','Ulugbek','Bobur','Doniyor','Eldor','Farhodjon','Ibrohim','Jahongir'],
    nb: ['Aziza','Kamola','Dilorom','Sarvar','Navruz'],
    surnames: ['Karimov','Tashkentov','Rakhimov','Umarov','Nazarov','Tursunov','Yunusov','Mirzayev','Khasanov','Ergashev']
  },
};

// ─── Cities with real coordinates ───────────────────────────────────────────
const CITIES = {
  DE: [
    {city:'Berlin', lat:52.52, lng:13.405},
    {city:'Munich', lat:48.137, lng:11.576},
    {city:'Hamburg', lat:53.551, lng:9.994},
    {city:'Cologne', lat:50.937, lng:6.960},
    {city:'Frankfurt', lat:50.110, lng:8.682},
    {city:'Stuttgart', lat:48.775, lng:9.182},
    {city:'Düsseldorf', lat:51.225, lng:6.776},
    {city:'Leipzig', lat:51.340, lng:12.375},
    {city:'Nuremberg', lat:49.453, lng:11.077},
    {city:'Dresden', lat:51.050, lng:13.738},
  ],
  GB: [
    {city:'London', lat:51.507, lng:-0.127},
    {city:'Manchester', lat:53.480, lng:-2.242},
    {city:'Birmingham', lat:52.480, lng:-1.902},
    {city:'Leeds', lat:53.800, lng:-1.549},
    {city:'Glasgow', lat:55.864, lng:-4.251},
    {city:'Edinburgh', lat:55.953, lng:-3.189},
    {city:'Liverpool', lat:53.408, lng:-2.991},
    {city:'Bristol', lat:51.454, lng:-2.587},
    {city:'Sheffield', lat:53.381, lng:-1.469},
    {city:'Cardiff', lat:51.481, lng:-3.180},
  ],
  FR: [
    {city:'Paris', lat:48.857, lng:2.352},
    {city:'Marseille', lat:43.296, lng:5.381},
    {city:'Lyon', lat:45.748, lng:4.846},
    {city:'Toulouse', lat:43.604, lng:1.444},
    {city:'Nice', lat:43.710, lng:7.262},
    {city:'Nantes', lat:47.218, lng:-1.553},
    {city:'Montpellier', lat:43.611, lng:3.877},
    {city:'Strasbourg', lat:48.573, lng:7.752},
    {city:'Bordeaux', lat:44.837, lng:-0.579},
    {city:'Lille', lat:50.631, lng:3.057},
  ],
  ES: [
    {city:'Madrid', lat:40.416, lng:-3.703},
    {city:'Barcelona', lat:41.385, lng:2.173},
    {city:'Valencia', lat:39.470, lng:-0.376},
    {city:'Seville', lat:37.389, lng:-5.984},
    {city:'Zaragoza', lat:41.649, lng:-0.887},
    {city:'Málaga', lat:36.721, lng:-4.421},
    {city:'Bilbao', lat:43.263, lng:-2.935},
    {city:'Alicante', lat:38.345, lng:-0.483},
    {city:'Córdoba', lat:37.888, lng:-4.779},
    {city:'Granada', lat:37.177, lng:-3.598},
  ],
  IT: [
    {city:'Rome', lat:41.902, lng:12.496},
    {city:'Milan', lat:45.464, lng:9.190},
    {city:'Naples', lat:40.851, lng:14.268},
    {city:'Turin', lat:45.070, lng:7.686},
    {city:'Palermo', lat:38.116, lng:13.361},
    {city:'Genoa', lat:44.405, lng:8.946},
    {city:'Bologna', lat:44.494, lng:11.342},
    {city:'Florence', lat:43.769, lng:11.255},
    {city:'Venice', lat:45.437, lng:12.335},
    {city:'Catania', lat:37.502, lng:15.087},
  ],
  NL: [
    {city:'Amsterdam', lat:52.370, lng:4.895},
    {city:'Rotterdam', lat:51.924, lng:4.477},
    {city:'The Hague', lat:52.070, lng:4.300},
    {city:'Utrecht', lat:52.090, lng:5.121},
    {city:'Eindhoven', lat:51.441, lng:5.479},
    {city:'Groningen', lat:53.219, lng:6.566},
    {city:'Tilburg', lat:51.560, lng:5.091},
    {city:'Almere', lat:52.370, lng:5.215},
    {city:'Breda', lat:51.589, lng:4.779},
    {city:'Leiden', lat:52.160, lng:4.493},
  ],
  SE: [
    {city:'Stockholm', lat:59.331, lng:18.065},
    {city:'Gothenburg', lat:57.707, lng:11.967},
    {city:'Malmö', lat:55.604, lng:13.003},
    {city:'Uppsala', lat:59.858, lng:17.645},
    {city:'Västerås', lat:59.609, lng:16.544},
    {city:'Örebro', lat:59.275, lng:15.213},
    {city:'Linköping', lat:58.411, lng:15.621},
    {city:'Helsingborg', lat:56.044, lng:12.694},
    {city:'Jönköping', lat:57.782, lng:14.161},
    {city:'Norrköping', lat:58.596, lng:16.181},
  ],
  PL: [
    {city:'Warsaw', lat:52.229, lng:21.012},
    {city:'Kraków', lat:50.065, lng:19.945},
    {city:'Łódź', lat:51.759, lng:19.457},
    {city:'Wrocław', lat:51.107, lng:17.038},
    {city:'Poznań', lat:52.408, lng:16.934},
    {city:'Gdańsk', lat:54.352, lng:18.646},
    {city:'Szczecin', lat:53.428, lng:14.552},
    {city:'Bydgoszcz', lat:53.123, lng:18.008},
    {city:'Lublin', lat:51.247, lng:22.568},
    {city:'Katowice', lat:50.259, lng:19.022},
  ],
  US: [
    {city:'New York', lat:40.713, lng:-74.006},
    {city:'Los Angeles', lat:34.052, lng:-118.244},
    {city:'Chicago', lat:41.878, lng:-87.630},
    {city:'Houston', lat:29.760, lng:-95.370},
    {city:'Phoenix', lat:33.448, lng:-112.074},
    {city:'Philadelphia', lat:39.952, lng:-75.165},
    {city:'San Antonio', lat:29.424, lng:-98.494},
    {city:'San Diego', lat:32.715, lng:-117.157},
    {city:'Dallas', lat:32.776, lng:-96.797},
    {city:'San Francisco', lat:37.774, lng:-122.419},
    {city:'Austin', lat:30.267, lng:-97.743},
    {city:'Seattle', lat:47.606, lng:-122.332},
    {city:'Denver', lat:39.739, lng:-104.984},
    {city:'Boston', lat:42.360, lng:-71.059},
    {city:'Nashville', lat:36.162, lng:-86.781},
    {city:'Miami', lat:25.775, lng:-80.208},
    {city:'Portland', lat:45.523, lng:-122.676},
    {city:'Las Vegas', lat:36.175, lng:-115.136},
    {city:'Atlanta', lat:33.749, lng:-84.388},
    {city:'Minneapolis', lat:44.977, lng:-93.265},
  ],
  BR: [
    {city:'São Paulo', lat:-23.550, lng:-46.633},
    {city:'Rio de Janeiro', lat:-22.906, lng:-43.173},
    {city:'Brasília', lat:-15.780, lng:-47.929},
    {city:'Salvador', lat:-12.972, lng:-38.501},
    {city:'Fortaleza', lat:-3.730, lng:-38.522},
    {city:'Belo Horizonte', lat:-19.917, lng:-43.934},
    {city:'Manaus', lat:-3.100, lng:-60.025},
    {city:'Curitiba', lat:-25.428, lng:-49.273},
    {city:'Recife', lat:-8.054, lng:-34.881},
    {city:'Porto Alegre', lat:-30.034, lng:-51.218},
  ],
  MX: [
    {city:'Mexico City', lat:19.428, lng:-99.128},
    {city:'Guadalajara', lat:20.676, lng:-103.347},
    {city:'Monterrey', lat:25.686, lng:-100.316},
    {city:'Puebla', lat:19.041, lng:-98.206},
    {city:'Tijuana', lat:32.514, lng:-117.038},
    {city:'León', lat:21.122, lng:-101.682},
    {city:'Juárez', lat:31.740, lng:-106.487},
    {city:'Zapopan', lat:20.722, lng:-103.391},
    {city:'Mérida', lat:20.967, lng:-89.623},
    {city:'Cancún', lat:21.161, lng:-86.851},
  ],
  JP: [
    {city:'Tokyo', lat:35.682, lng:139.759},
    {city:'Osaka', lat:34.694, lng:135.502},
    {city:'Kyoto', lat:35.012, lng:135.768},
    {city:'Yokohama', lat:35.443, lng:139.638},
    {city:'Nagoya', lat:35.181, lng:136.907},
    {city:'Sapporo', lat:43.062, lng:141.354},
    {city:'Fukuoka', lat:33.590, lng:130.401},
    {city:'Kobe', lat:34.690, lng:135.196},
    {city:'Hiroshima', lat:34.385, lng:132.455},
    {city:'Sendai', lat:38.268, lng:140.869},
  ],
  KR: [
    {city:'Seoul', lat:37.566, lng:126.978},
    {city:'Busan', lat:35.180, lng:129.075},
    {city:'Incheon', lat:37.456, lng:126.705},
    {city:'Daegu', lat:35.871, lng:128.602},
    {city:'Daejeon', lat:36.351, lng:127.385},
    {city:'Gwangju', lat:35.160, lng:126.852},
    {city:'Ulsan', lat:35.538, lng:129.311},
    {city:'Suwon', lat:37.263, lng:127.029},
    {city:'Changwon', lat:35.228, lng:128.682},
    {city:'Jeonju', lat:35.820, lng:127.149},
  ],
  IN: [
    {city:'Mumbai', lat:19.076, lng:72.878},
    {city:'Delhi', lat:28.644, lng:77.216},
    {city:'Bangalore', lat:12.971, lng:77.594},
    {city:'Hyderabad', lat:17.387, lng:78.491},
    {city:'Chennai', lat:13.083, lng:80.270},
    {city:'Kolkata', lat:22.573, lng:88.364},
    {city:'Pune', lat:18.520, lng:73.857},
    {city:'Ahmedabad', lat:23.023, lng:72.572},
    {city:'Jaipur', lat:26.912, lng:75.788},
    {city:'Lucknow', lat:26.847, lng:80.947},
    {city:'Chandigarh', lat:30.733, lng:76.779},
    {city:'Bhopal', lat:23.259, lng:77.413},
  ],
  ID: [
    {city:'Jakarta', lat:-6.208, lng:106.846},
    {city:'Surabaya', lat:-7.249, lng:112.751},
    {city:'Bandung', lat:-6.917, lng:107.619},
    {city:'Medan', lat:3.595, lng:98.672},
    {city:'Semarang', lat:-6.966, lng:110.419},
    {city:'Makassar', lat:-5.135, lng:119.412},
    {city:'Palembang', lat:-2.991, lng:104.756},
    {city:'Tangerang', lat:-6.178, lng:106.630},
    {city:'Depok', lat:-6.402, lng:106.794},
    {city:'Denpasar', lat:-8.650, lng:115.217},
  ],
  PH: [
    {city:'Manila', lat:14.599, lng:120.984},
    {city:'Quezon City', lat:14.676, lng:121.044},
    {city:'Davao', lat:7.191, lng:125.455},
    {city:'Cebu City', lat:10.317, lng:123.891},
    {city:'Caloocan', lat:14.657, lng:120.966},
    {city:'Zamboanga', lat:6.910, lng:122.073},
    {city:'Antipolo', lat:14.586, lng:121.176},
    {city:'Pasig', lat:14.576, lng:121.086},
    {city:'Makati', lat:14.554, lng:121.020},
    {city:'Taguig', lat:14.521, lng:121.051},
  ],
  TH: [
    {city:'Bangkok', lat:13.756, lng:100.502},
    {city:'Chiang Mai', lat:18.789, lng:98.985},
    {city:'Phuket', lat:7.880, lng:98.392},
    {city:'Khon Kaen', lat:16.432, lng:102.836},
    {city:'Pattaya', lat:12.927, lng:100.877},
    {city:'Hat Yai', lat:7.008, lng:100.477},
    {city:'Udon Thani', lat:17.415, lng:102.787},
    {city:'Nakhon Ratchasima', lat:14.979, lng:102.098},
    {city:'Chonburi', lat:13.361, lng:100.985},
    {city:'Rayong', lat:12.683, lng:101.282},
  ],
  CN: [
    {city:'Shanghai', lat:31.228, lng:121.474},
    {city:'Beijing', lat:39.906, lng:116.391},
    {city:'Guangzhou', lat:23.130, lng:113.264},
    {city:'Shenzhen', lat:22.543, lng:114.058},
    {city:'Chengdu', lat:30.572, lng:104.066},
    {city:'Wuhan', lat:30.593, lng:114.305},
    {city:'Chongqing', lat:29.563, lng:106.551},
    {city:'Hangzhou', lat:30.274, lng:120.155},
    {city:'Xi\'an', lat:34.341, lng:108.940},
    {city:'Nanjing', lat:32.061, lng:118.796},
  ],
  VN: [
    {city:'Ho Chi Minh City', lat:10.823, lng:106.630},
    {city:'Hanoi', lat:21.028, lng:105.804},
    {city:'Da Nang', lat:16.068, lng:108.212},
    {city:'Hai Phong', lat:20.844, lng:106.688},
    {city:'Can Tho', lat:10.045, lng:105.747},
    {city:'Bien Hoa', lat:10.957, lng:106.843},
    {city:'Hue', lat:16.467, lng:107.590},
    {city:'Nha Trang', lat:12.245, lng:109.193},
    {city:'Buon Ma Thuot', lat:12.667, lng:108.050},
    {city:'Vinh', lat:18.679, lng:105.682},
  ],
  TR: [
    {city:'Istanbul', lat:41.008, lng:28.978},
    {city:'Ankara', lat:39.925, lng:32.837},
    {city:'Izmir', lat:38.423, lng:27.143},
    {city:'Bursa', lat:40.191, lng:29.061},
    {city:'Antalya', lat:36.886, lng:30.701},
    {city:'Konya', lat:37.871, lng:32.485},
    {city:'Gaziantep', lat:37.066, lng:37.383},
    {city:'Adana', lat:37.000, lng:35.321},
    {city:'Kayseri', lat:38.731, lng:35.487},
    {city:'Diyarbakır', lat:37.912, lng:40.219},
  ],
  EG: [
    {city:'Cairo', lat:30.044, lng:31.236},
    {city:'Alexandria', lat:31.200, lng:29.919},
    {city:'Giza', lat:30.013, lng:31.208},
    {city:'Shubra El Kheima', lat:30.128, lng:31.242},
    {city:'Port Said', lat:31.260, lng:32.284},
    {city:'Suez', lat:29.967, lng:32.549},
    {city:'Luxor', lat:25.687, lng:32.639},
    {city:'Aswan', lat:24.089, lng:32.900},
    {city:'Hurghada', lat:27.257, lng:33.812},
    {city:'Ismailia', lat:30.604, lng:32.272},
  ],
  NG: [
    {city:'Lagos', lat:6.524, lng:3.379},
    {city:'Kano', lat:12.000, lng:8.516},
    {city:'Ibadan', lat:7.377, lng:3.947},
    {city:'Abuja', lat:9.057, lng:7.495},
    {city:'Port Harcourt', lat:4.815, lng:7.049},
    {city:'Benin City', lat:6.338, lng:5.627},
    {city:'Kaduna', lat:10.526, lng:7.443},
    {city:'Enugu', lat:6.441, lng:7.499},
    {city:'Maiduguri', lat:11.833, lng:13.151},
    {city:'Owerri', lat:5.485, lng:7.034},
  ],
  ZA: [
    {city:'Johannesburg', lat:-26.204, lng:28.047},
    {city:'Cape Town', lat:-33.926, lng:18.424},
    {city:'Durban', lat:-29.857, lng:31.030},
    {city:'Pretoria', lat:-25.747, lng:28.188},
    {city:'Soweto', lat:-26.268, lng:27.858},
    {city:'Port Elizabeth', lat:-33.918, lng:25.570},
    {city:'East London', lat:-33.000, lng:27.914},
    {city:'Bloemfontein', lat:-29.085, lng:26.159},
    {city:'Polokwane', lat:-23.901, lng:29.469},
    {city:'Nelspruit', lat:-25.474, lng:30.970},
  ],
  MA: [
    {city:'Casablanca', lat:33.589, lng:-7.614},
    {city:'Rabat', lat:34.013, lng:-6.832},
    {city:'Marrakech', lat:31.631, lng:-7.989},
    {city:'Fes', lat:34.033, lng:-5.000},
    {city:'Tangier', lat:35.760, lng:-5.834},
    {city:'Agadir', lat:30.420, lng:-9.598},
    {city:'Meknes', lat:33.893, lng:-5.547},
    {city:'Oujda', lat:34.689, lng:-1.912},
    {city:'Kenitra', lat:34.261, lng:-6.580},
    {city:'Tétouan', lat:35.577, lng:-5.369},
  ],
  AE: [
    {city:'Dubai', lat:25.204, lng:55.270},
    {city:'Abu Dhabi', lat:24.466, lng:54.366},
    {city:'Sharjah', lat:25.337, lng:55.412},
    {city:'Ajman', lat:25.405, lng:55.514},
    {city:'Ras Al Khaimah', lat:25.790, lng:55.943},
    {city:'Fujairah', lat:25.128, lng:56.340},
    {city:'Umm Al Quwain', lat:25.565, lng:55.555},
  ],
  KE: [
    {city:'Nairobi', lat:-1.286, lng:36.820},
    {city:'Mombasa', lat:-4.048, lng:39.668},
    {city:'Kisumu', lat:-0.100, lng:34.750},
    {city:'Nakuru', lat:-0.303, lng:36.080},
    {city:'Eldoret', lat:0.520, lng:35.270},
    {city:'Thika', lat:-1.033, lng:37.083},
    {city:'Malindi', lat:-3.219, lng:40.117},
    {city:'Kitale', lat:1.015, lng:35.006},
  ],
  AU: [
    {city:'Sydney', lat:-33.868, lng:151.207},
    {city:'Melbourne', lat:-37.814, lng:144.963},
    {city:'Brisbane', lat:-27.469, lng:153.025},
    {city:'Perth', lat:-31.950, lng:115.860},
    {city:'Adelaide', lat:-34.929, lng:138.601},
    {city:'Canberra', lat:-35.282, lng:149.128},
    {city:'Gold Coast', lat:-28.017, lng:153.400},
    {city:'Hobart', lat:-42.882, lng:147.328},
    {city:'Darwin', lat:-12.463, lng:130.841},
    {city:'Newcastle', lat:-32.927, lng:151.777},
  ],
  NZ: [
    {city:'Auckland', lat:-36.848, lng:174.763},
    {city:'Wellington', lat:-41.286, lng:174.776},
    {city:'Christchurch', lat:-43.532, lng:172.637},
    {city:'Hamilton', lat:-37.788, lng:175.280},
    {city:'Tauranga', lat:-37.688, lng:176.167},
    {city:'Napier', lat:-39.493, lng:176.912},
    {city:'Dunedin', lat:-45.874, lng:170.504},
    {city:'Invercargill', lat:-46.413, lng:168.356},
    {city:'Rotorua', lat:-38.137, lng:176.249},
    {city:'New Plymouth', lat:-39.057, lng:174.075},
  ],
  CA: [
    {city:'Toronto', lat:43.700, lng:-79.416},
    {city:'Vancouver', lat:49.283, lng:-123.121},
    {city:'Montreal', lat:45.508, lng:-73.554},
    {city:'Calgary', lat:51.044, lng:-114.071},
    {city:'Edmonton', lat:53.546, lng:-113.490},
    {city:'Ottawa', lat:45.424, lng:-75.695},
    {city:'Winnipeg', lat:49.895, lng:-97.138},
    {city:'Quebec City', lat:46.813, lng:-71.208},
    {city:'Hamilton', lat:43.255, lng:-79.870},
    {city:'Saskatoon', lat:52.133, lng:-106.670},
  ],
  CO: [
    {city:'Bogotá', lat:4.711, lng:-74.073},
    {city:'Medellín', lat:6.244, lng:-75.574},
    {city:'Cali', lat:3.451, lng:-76.532},
    {city:'Barranquilla', lat:10.964, lng:-74.796},
    {city:'Cartagena', lat:10.400, lng:-75.513},
    {city:'Cúcuta', lat:7.893, lng:-72.505},
    {city:'Pereira', lat:4.814, lng:-75.696},
    {city:'Santa Marta', lat:11.240, lng:-74.198},
    {city:'Ibagué', lat:4.438, lng:-75.232},
    {city:'Bucaramanga', lat:7.119, lng:-73.122},
  ],
  AR: [
    {city:'Buenos Aires', lat:-34.603, lng:-58.382},
    {city:'Córdoba', lat:-31.416, lng:-64.183},
    {city:'Rosario', lat:-32.946, lng:-60.639},
    {city:'Mendoza', lat:-32.890, lng:-68.845},
    {city:'Tucumán', lat:-26.817, lng:-65.207},
    {city:'Mar del Plata', lat:-38.000, lng:-57.558},
    {city:'Salta', lat:-24.785, lng:-65.412},
    {city:'Santa Fe', lat:-31.636, lng:-60.698},
    {city:'San Juan', lat:-31.537, lng:-68.536},
    {city:'Resistencia', lat:-27.450, lng:-58.987},
  ],
  KZ: [
    {city:'Almaty', lat:43.236, lng:76.945},
    {city:'Astana', lat:51.181, lng:71.446},
    {city:'Shymkent', lat:42.317, lng:69.595},
    {city:'Karaganda', lat:49.807, lng:73.088},
    {city:'Aktobe', lat:50.279, lng:57.207},
    {city:'Taraz', lat:42.900, lng:71.362},
    {city:'Pavlodar', lat:52.300, lng:76.950},
    {city:'Ust-Kamenogorsk', lat:49.988, lng:82.627},
    {city:'Semey', lat:50.411, lng:80.226},
    {city:'Atyrau', lat:47.117, lng:51.921},
  ],
  UZ: [
    {city:'Tashkent', lat:41.299, lng:69.240},
    {city:'Samarkand', lat:39.655, lng:66.975},
    {city:'Namangan', lat:40.998, lng:71.642},
    {city:'Andijan', lat:40.783, lng:72.344},
    {city:'Nukus', lat:42.466, lng:59.604},
    {city:'Fergana', lat:40.387, lng:71.784},
    {city:'Bukhara', lat:39.767, lng:64.421},
    {city:'Qarshi', lat:38.866, lng:65.790},
    {city:'Termez', lat:37.224, lng:67.278},
    {city:'Navoi', lat:40.099, lng:65.379},
  ],
};

// ─── Dream data arrays ───────────────────────────────────────────────────────
const CATEGORIES = [
  'flying','lucid','nightmare','prophetic','healing','funny','scary','spiritual',
  'recurring','shadow','animals','falling','love','adventure','underwater','space',
  'childhood','nature','chase','timetravel','water','death','school','erotic',
  'ufo','celebrity','money','family','horror',
];

const MOODS = [
  'free','yearning','scared','transcendent','peaceful','curious','anxious','hopeful',
  'mystical','excited','reflective','brave','enchanted','melancholic','serene','awed',
  'amused','nostalgic','blissful','bewildered','terrified','euphoric','grateful','proud',
  'confused','empowered','vulnerable','amazed','inspired','restless',
];

const ZODIAC = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const LANGUAGES = {
  DE: ['de','en'], GB: ['en'], FR: ['fr','en'], ES: ['es','en'], IT: ['it','en'],
  NL: ['nl','en'], SE: ['sv','en'], PL: ['pl','en'], US: ['en'], BR: ['pt'],
  MX: ['es'], JP: ['ja'], KR: ['ko'], IN: ['hi','en'], ID: ['id'],
  PH: ['tl','en'], TH: ['th'], CN: ['zh'], VN: ['vi'], TR: ['tr'],
  EG: ['ar'], NG: ['en'], ZA: ['en','zu','af'], MA: ['ar','fr'], AE: ['ar','en'],
  KE: ['sw','en'], AU: ['en'], NZ: ['en'], CA: ['en','fr'], CO: ['es'],
  AR: ['es'], KZ: ['kk','ru'], UZ: ['uz','ru'],
};

const AVATARS_FEMALE = ['👩','👩🏻','👩🏼','👩🏽','👩🏾','👩🏿','👩‍🦰','👩‍🦱','👩‍🦲','👩‍🦳','👱‍♀️'];
const AVATARS_MALE   = ['👨','👨🏻','👨🏼','👨🏽','👨🏾','👨🏿','👨‍🦰','👨‍🦱','🧔','👱‍♂️'];
const AVATARS_NB     = ['🧑','🧑🏻','🧑🏼','🧑🏽','🧑🏾','🧑🏿'];

const BIOS = [
  'Dream cartographer, mapping the unconscious night by night.',
  'Lucid dreamer since childhood — every night is a new world.',
  'I collect dream symbols the way others collect stamps.',
  'Once flew over the Himalayas in a dream and never looked back.',
  'Shadow work practitioner. The dark dreams teach me most.',
  'I believe dreams are letters from our future selves.',
  'Night shift nurse who dreams of infinite hospital corridors.',
  'Dream journaler for 8 years. Still surprised every morning.',
  'Recurring dream: ocean that turns to glass under my feet.',
  'Searching for the city I always return to in my dreams.',
  'Jungian enthusiast. Archetypes are real in my bedroom.',
  'I dream in three languages and wake in none of them.',
  'My dreams have better cinematography than most films.',
  'Chronic lucid dreamer seeking fellow conscious travelers.',
  'Dream weaver, reality checker, moonlight philosopher.',
  'I once shook hands with my future self in a dream.',
  'The sleeping world is my favorite place to explore.',
  'Astral projector in training. Progress: mixed results.',
  'Dreams are the brain\'s poetry — I\'m here for every verse.',
  'Nightmare transformer: I turn fear into insight.',
  'Night owl whose dreams are longer than the waking day.',
  'I keep a voice recorder on my nightstand for dream gold.',
  'Professional overthinker, amateur dreamologist.',
  'My dream alter ego lives a much more interesting life.',
  'Seeking the pattern in the chaos of nightly visions.',
  'Dream alchemist: turning sleep into self-knowledge.',
  'Perpetual student of the subconscious curriculum.',
  'I follow the white rabbit every single night.',
  'The veil between worlds is thinnest in my dreams.',
  'Rebuilding my inner world one dream at a time.',
  'Symbols, synchronicities, and sleep — my holy trinity.',
  'I have 47 recurring dream locations. I know them by heart.',
  'Falling dreams are my cardio.',
  'Dream researcher, amateur neuroscientist, curious human.',
  'Healing through dreams — each night a therapy session.',
  'My dreams are more vivid than daylight. I prefer them.',
  'Connecting the dots between dreams and waking life.',
  'I dream of mountains I\'ve never visited but always recognize.',
  'Spiritual dreamer. Every night is a pilgrimage.',
  'The unconscious is the most honest storyteller I know.',
  'Decoding symbols since my first flying dream at age 7.',
  'Dream diarist with coffee stains on every entry.',
  'I meet the same strangers in dreams. Are they real?',
  'Explorer of inner landscapes. Zero travel budget needed.',
  'Dreaming is my superpower. Waking up is the side effect.',
  'Cosmic wanderer. Dreams are my star map.',
  'I speak fluent symbolism. Dreams are my native language.',
  'Nightmare veteran turned dream guide.',
  'Sleeping is research. Dreaming is fieldwork.',
  'The night always has something to teach me.',
];

const DREAM_SUMMARIES = [
  'Flew over endless ocean as dawn broke below — weightless and infinite.',
  'Ran through a city that kept rearranging itself behind me.',
  'Spoke with my grandmother who passed years ago — she was laughing.',
  'Found a door in my childhood home that leads to another century.',
  'The moon split open and music poured out like liquid silver.',
  'Was a tree for one night and felt every root underground.',
  'Underwater library where books breathed like fish.',
  'Chased by a shadow that turned into light when I faced it.',
  'Flew through storm clouds and came out above a golden desert.',
  'Watched stars fall into my palms and turn into seeds.',
  'Built a house made of old memories — it kept changing shape.',
  'Walked through a mirror and found a quieter version of myself.',
  'Ocean receded to reveal an ancient drowned city, perfectly preserved.',
  'Fell upward through the sky until I reached the edge of the universe.',
  'Sat at a table with everyone I\'d ever lost — they were fine.',
  'The forest spoke to me in a language I almost understood.',
  'Drove a car through a tunnel that led to my childhood street.',
  'Danced alone in a cathedral lit by fireflies.',
  'Found my reflection in a pool that showed me ten years hence.',
  'A wolf led me through snow to a door of light.',
  'Every book I opened told a story about tomorrow.',
  'The city dissolved into sand and I was the last one watching.',
  'Held a conversation with the moon — she was tired but kind.',
  'Climbed a mountain and at the top found my own front door.',
  'Turned into a bird and spent the dream migrating south.',
  'The clock melted and time became a place I could walk through.',
  'My hands turned to flowers and I wasn\'t afraid.',
  'Swam through clouds like warm water, breathing deeply.',
  'A train arrived that had been delayed since childhood.',
  'Found a garden where every plant was a memory in bloom.',
  'The city was made of glass and I could see through everyone.',
  'Stood at the edge of a cliff that had no bottom — and jumped.',
  'An old friend returned to give me advice I didn\'t know I needed.',
  'The night sky was a painting and I held the brush.',
  'Spoke a language that existed only in the dream.',
  'A river of light ran through my childhood bedroom.',
  'Infinite library — every book was someone\'s entire life.',
  'The earthquake cracked the earth and revealed a staircase down.',
  'Followed a child version of myself through a maze of sunlit rooms.',
  'The sea was perfectly still and I walked across it to the horizon.',
  'Met a stranger who knew every dream I\'d ever had.',
  'My shadow peeled off and asked to stay behind.',
  'Time moved backward and I relived my best day ever.',
  'A door appeared in the middle of a field. I walked through.',
  'The whole city was asleep and I was the only one awake.',
  'Transformed into rain and fell across a summer city.',
  'The night turned inside out and revealed its machinery.',
  'Counted stars until I realized I was counting my own heartbeats.',
  'Every room led to another room, each more beautiful than the last.',
  'My dream self left me a note that I almost remembered.',
  'The storm was gentle and smelled like somewhere safe.',
  'All the animals came to listen to something I couldn\'t hear yet.',
  'I was both the dreamer and the dream at once.',
  'A lighthouse guided me through a fog made of old songs.',
  'The desert bloomed overnight and I was watching from above.',
  'Stood in a crowd of myself — all different ages, all waving.',
  'The ocean spoke my name and I woke up crying, but happy.',
  'Healed an old wound in a dream — felt it in my body at dawn.',
  'Found a map that led to the center of myself.',
  'The world ended gently, like a song fading out.',
  'A bridge stretched to the horizon and someone was waiting there.',
  'Opened a jar and all my worries turned into butterflies.',
  'The night was warm and the stars were close enough to touch.',
  'Walked backward through my life and understood it differently.',
  'The child I was handed me something important I\'d forgotten.',
  'Moonlight solidified and I walked on it to the other shore.',
  'Every door I knocked on opened before I touched it.',
  'The mountain moved out of my way and I said thank you.',
  'I became the ocean for one night — vast and impossibly calm.',
  'My fears assembled into a throne and offered it to me.',
  'All the words I\'d never said hung in the air like lanterns.',
  'A voice from nowhere said "you\'re on the right path" — I believed it.',
  'Found an exit from the recurring dream — walked through.',
  'The darkness was not empty but full of waiting.',
  'I played a song I don\'t know how to play and it was perfect.',
  'The dream gave me back something I thought was gone forever.',
  'Followed the sound of water to the origin of everything.',
  'Two versions of my life sat side by side — I chose one.',
  'The fog lifted and I was exactly where I needed to be.',
  'Everything I\'d been carrying dissolved in the morning dream.',
  'An ancestor showed me how to read the sky.',
  'The dream ended mid-sentence and I\'m still waiting.',
  'Stars spelled my name and then rearranged into a question.',
  'The river knew where it was going. I followed without fear.',
  'I slept inside a dream inside a dream — woke up rested.',
  'The silence in the dream was the loudest thing I\'ve heard.',
  'Light poured in from a direction that doesn\'t exist in waking life.',
  'The dream told me: this is only the beginning.',
  'Swam through a sea of memory to reach a forgotten shore.',
  'The labyrinth opened up into a meadow when I stopped running.',
  'A door creaked open and a warm wind carried the smell of home.',
  'I was everyone and no one, and it was the freest I\'ve felt.',
  'The mountain range was my spine, and I finally understood my body.',
  'Night after night the same lighthouse — I finally went inside.',
  'Found a version of my city built before I was born.',
  'The clock in the dream showed a time that doesn\'t exist yet.',
  'Gathered courage in a dream and woke still holding it.',
  'The dream remembered something I had forgotten to grieve.',
  'Sky full of whales, slow and enormous, heading home.',
  'Every shadow in the dream was protecting something tender.',
  'I turned around and there was my whole life, laid out like a map.',
];

// ─── Geographic distribution ─────────────────────────────────────────────────
const DISTRIBUTION = [
  // Europe: 300
  { country:'DE', count:80 },
  { country:'GB', count:40 },
  { country:'FR', count:35 },
  { country:'ES', count:30 },
  { country:'IT', count:30 },
  { country:'NL', count:25 },
  { country:'SE', count:20 },
  { country:'PL', count:20 },
  // others Europe ~20 spread across remaining
  { country:'DE', count:5 }, // padding
  { country:'FR', count:5 },
  { country:'ES', count:5 },
  { country:'IT', count:5 },
  // Americas: 250
  { country:'US', count:100 },
  { country:'BR', count:50 },
  { country:'MX', count:30 },
  { country:'CA', count:25 },
  { country:'CO', count:20 },
  { country:'AR', count:15 },
  { country:'MX', count:10 },
  // Asia: 250
  { country:'IN', count:60 },
  { country:'JP', count:40 },
  { country:'KR', count:30 },
  { country:'ID', count:25 },
  { country:'PH', count:20 },
  { country:'TH', count:20 },
  { country:'CN', count:25 },
  { country:'VN', count:15 },
  { country:'IN', count:15 },
  // Middle East/Africa: 100
  { country:'TR', count:30 },
  { country:'EG', count:15 },
  { country:'NG', count:15 },
  { country:'ZA', count:12 },
  { country:'MA', count:10 },
  { country:'AE', count:10 },
  { country:'KE', count:8 },
  // Oceania: 50
  { country:'AU', count:35 },
  { country:'NZ', count:15 },
  // Central Asia: 50
  { country:'KZ', count:30 },
  { country:'UZ', count:20 },
];

// ─── Gender weights: 55% f, 35% m, 10% nb ────────────────────────────────────
function pickGender() {
  const r = rand();
  if (r < 0.55) return 'f';
  if (r < 0.90) return 'm';
  return 'nb';
}

function pickName(countryCode, gender) {
  const pool = NAMES[countryCode] || NAMES['US'];
  const list = pool[gender] || pool['f'];
  const surname = pick(pool.surnames);
  const first = pick(list);
  return `${first} ${surname}`;
}

function pickAvatar(gender) {
  if (gender === 'f')  return pick(AVATARS_FEMALE);
  if (gender === 'm')  return pick(AVATARS_MALE);
  return pick(AVATARS_NB);
}

function randomDate() {
  // 2025-01-01 to 2026-04-01
  const start = new Date('2025-01-01').getTime();
  const end   = new Date('2026-04-01').getTime();
  const d = new Date(start + rand() * (end - start));
  return d.toISOString().slice(0, 10);
}

function genderLabel(g) {
  if (g === 'f') return 'female';
  if (g === 'm') return 'male';
  return 'non-binary';
}

// ─── Build bot list ───────────────────────────────────────────────────────────
const bots = [];
let idCounter = 1;

for (const { country, count } of DISTRIBUTION) {
  const cityList = CITIES[country] || CITIES['US'];
  for (let i = 0; i < count; i++) {
    const gender = pickGender();
    const name   = pickName(country, gender);
    const location = pick(cityList);
    const langs  = LANGUAGES[country] || ['en'];
    const gLabel = genderLabel(gender);

    bots.push({
      id: `bot${String(idCounter).padStart(4, '0')}`,
      name,
      avatar: pickAvatar(gender),
      bio: pick(BIOS),
      city: location.city,
      country,
      lat: parseFloat((location.lat + (rand() - 0.5) * 0.05).toFixed(4)),
      lng: parseFloat((location.lng + (rand() - 0.5) * 0.05).toFixed(4)),
      category: pick(CATEGORIES),
      mood: pick(MOODS),
      dreamSummary: pick(DREAM_SUMMARIES),
      matchPct: randInt(55, 99),
      zodiacSign: pick(ZODIAC),
      gender: gLabel,
      age: randInt(18, 55),
      joinedDate: randomDate(),
      isBot: true,
      privacyLevel: 'FRIENDS',
      communicationPreference: 'CLOSED',
      isAnonymous: false,
      canMessage: false,
      contributionsCount: randInt(0, 50),
      languages: langs,
    });
    idCounter++;
  }
}

// Trim to exactly 1000 if over
const final = bots.slice(0, 1000);

// ─── Serialize ────────────────────────────────────────────────────────────────
function serialize(bot) {
  const langs = JSON.stringify(bot.languages);
  return `  {
    id: '${bot.id}',
    name: '${bot.name.replace(/'/g, "\\'")}',
    avatar: '${bot.avatar}',
    bio: '${bot.bio.replace(/'/g, "\\'")}',
    city: '${bot.city.replace(/'/g, "\\'")}',
    country: '${bot.country}',
    lat: ${bot.lat},
    lng: ${bot.lng},
    category: '${bot.category}',
    mood: '${bot.mood}',
    dreamSummary: '${bot.dreamSummary.replace(/'/g, "\\'")}',
    matchPct: ${bot.matchPct},
    zodiacSign: '${bot.zodiacSign}',
    gender: '${bot.gender}',
    age: ${bot.age},
    joinedDate: '${bot.joinedDate}',
    isBot: true,
    privacyLevel: 'FRIENDS',
    communicationPreference: 'CLOSED',
    isAnonymous: false,
    canMessage: false,
    contributionsCount: ${bot.contributionsCount},
    languages: ${langs},
  }`;
}

const tsContent = `import { BotSimUser } from '../types';

// Auto-generated by scripts/generateBots.mjs — do not edit manually.
// ${final.length} bot profiles, seed: 0xDEADBEEF

export const BOT_USERS: BotSimUser[] = [
${final.map(serialize).join(',\n')}
];
`;

const outPath = join(ROOT, 'data', 'botProfiles.ts');
mkdirSync(join(ROOT, 'data'), { recursive: true });
writeFileSync(outPath, tsContent, 'utf8');

console.log(`Done. Written ${final.length} bots to ${outPath}`);
console.log(`File size: ${(tsContent.length / 1024).toFixed(1)} KB`);

// Distribution summary
const countryCount = {};
for (const b of final) {
  countryCount[b.country] = (countryCount[b.country] || 0) + 1;
}
console.log('\nCountry distribution:');
Object.entries(countryCount).sort((a,b) => b[1]-a[1]).forEach(([c,n]) => console.log(`  ${c}: ${n}`));
