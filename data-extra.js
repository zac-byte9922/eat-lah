/* Original demonstration recipes and ingredient units; NOT sourced product prices or licensed videos. */
(() => {
const D=window.EATLAH_DATA, I=D.ingredients, C=D.catalog, E=D.entries;
const addIng={
  luosifen:['螺蛳粉','Luosifen (snail rice noodles)','包',420,'dry','Instant Food',null],
  sausage:['火腿肠','Chinese ham sausage','根',95,'dry','Canned & Preserved',null],
  crayfish:['预制小龙虾','Prepared crayfish','g',1.65,'frozen','Frozen Food',['seafood']],
  fishballs:['速冻鱼丸','Frozen fish balls','g',1.2,'frozen','Frozen Food',['seafood']],
  udon:['乌冬面','Udon noodles','包',290,'chilled','Noodles',['gluten']],
  oats:['燕麦片','Rolled oats','g',3.9,'dry','Cereals',null],
  milk:['牛奶','Milk','ml',0.62,'chilled','Dairy',['dairy']],
  corn:['甜玉米粒','Sweetcorn kernels','g',0.9,'frozen','Frozen Food',null],
  potato:['土豆','Potatoes','g',0.77,'dry','Vegetables',null],
  sweetpotato:['红薯','Sweet potatoes','g',0.86,'dry','Vegetables',null],
  onion:['洋葱','Onions','g',0.4,'dry','Vegetables',null],
  garlic:['蒜','Garlic','g',1.5,'dry','Vegetables',null],
  ham:['午餐肉','Luncheon meat','g',2.7,'dry','Canned & Preserved',null],
  tuna:['罐头金枪鱼','Canned tuna','g',1.25,'dry','Canned & Preserved',['seafood']],
  frozenveg:['速冻混合蔬菜','Frozen mixed vegetables','g',0.65,'frozen','Frozen Food',null],
  cheese:['芝士片','Cheese slices','片',65,'chilled','Dairy',['dairy']],
  yogurt:['原味酸奶','Plain yogurt','g',0.75,'chilled','Dairy',['dairy']],
  peanutbutter:['花生酱','Peanut butter','g',5.9,'dry','Spreads',['peanut']],
  shrimp:['虾仁','Peeled prawns','g',0.99,'frozen','Frozen Food',['seafood']],
  kimchi:['泡菜','Kimchi','g',0.27,'chilled','Chilled Food',null],
  carrots:['胡萝卜','Carrots','g',0.41,'chilled','Vegetables',null],
  cabbage:['包菜','Cabbage','g',0.25,'chilled','Vegetables',null],
  curry:['咖喱块','Curry roux','块',90,'dry','Sauces',null],
  scallion:['葱','Spring onions','g',0.32,'chilled','Vegetables',null],
  buns:['速冻包子','Frozen steamed buns','个',190,'frozen','Frozen Food',['gluten']],
  tortillas:['卷饼皮','Tortilla wraps','片',150,'dry','Bakery',['gluten']],
  apple:['苹果','Apples','个',95,'chilled','Fruit',null],
  mushroomsoup:['蘑菇浓汤罐头','Canned mushroom soup','罐',220,'dry','Canned Food',['dairy']],
  creamcorn:['玉米浓汤罐头','Cream-style corn','罐',240,'dry','Canned Food',null],
  ketchup:['番茄酱','Tomato ketchup','瓶',0,'dry','Oil & Condiments',null],
};
const pack={luosifen:[1,'1包 / 1 pack',5.2],sausage:[10,'10根 / 10 pcs',5.5],crayfish:[500,'500g / pack',12.9],fishballs:[500,'500g / pack',5.8],udon:[3,'3包 / 3 packs',5.4],oats:[500,'500g / pack',4.2],milk:[1000,'1L / carton',3.8],corn:[500,'500g / pack',3.5],potato:[1000,'1kg / bag',3.4],sweetpotato:[500,'500g / pack',3.3],onion:[500,'500g / pack',2.4],garlic:[200,'200g / pack',2.5],ham:[340,'340g / tin',4.0],tuna:[180,'180g / can',3.0],frozenveg:[500,'500g / pack',3.9],cheese:[10,'10 slices / pack',4.0],yogurt:[500,'500g / tub',4.2],peanutbutter:[340,'340g / jar',5.5],shrimp:[400,'400g / pack',9.0],kimchi:[300,'300g / pack',5.3],carrots:[500,'500g / pack',2.5],cabbage:[600,'~600g / head',3.0],curry:[8,'8 cubes / pack',4.8],scallion:[100,'100g / bunch',1.7],buns:[6,'6 pcs / pack',6.4],tortillas:[8,'8 wraps / pack',4.4],apple:[5,'5 pcs / pack',4.0],mushroomsoup:[1,'1 can',2.7],creamcorn:[1,'1 can',2.5],ketchup:[1,'1 bottle',3.0]};
for(const [k,[zh,en,unit,kcal,storage,aisle,allergens]] of Object.entries(addIng)){
 I[k]={zh,en,unit,kcal,storage,aisle,...(allergens?{allergens}:{})};
 const [size,label,price]=pack[k];C[k]={pack:size,label,price};
}
D.seasonings.push('ketchup');I.ketchup.pantry=true;
const R=(key,type,zh,en,emoji,minutes,tools,ingredients,instructions,moods=['normal'],tip='',extra={})=>{
 E[key]={type,zh,en,emoji,minutes,effort:minutes<=10?0:minutes<=20?1:2,tier:extra.tier||'cook',tools,ingredients,instructions,moods,tip,...extra};
};
// Full meal / staple cards, including packaged foods. Instructions are newly written for this demo.
R('luosifen','base','螺蛳粉','Luosifen noodle bowl','🍜',18,['electric-pot','stove','induction'],{luosifen:1},['打开包装，逐项确认米粉、汤包、辣油和小料。','按照本品牌包装说明煮米粉；不同品牌的预煮时间可能不一样。','按照包装说明加入汤包及所需水量，加热至充分沸腾。','最后加入腐竹、花生等小料，辣油先放少量，尝味后再加。'],['indulgent','normal'],'加料前查看原包装过敏原；味道浓重时可少放辣油。',{tier:'easy',addons:['addon-sausage','addon-egg','addon-cabbage','addon-friedegg']});
R('udon-soup','base','鸡蛋乌冬面','Egg udon soup','🍜',13,['electric-pot','stove','induction'],{udon:1,egg:1,greens:70},['青菜彻底洗净；准备一个鸡蛋。','小锅烧开适量水，下乌冬面按包装规定的时间煮开。','加入青菜煮熟，打入鸡蛋并继续加热至蛋液全熟。','按自己口味少量调味，稍凉再吃。'],['light','normal']);
R('oatmeal','base','牛奶燕麦粥','Milk oatmeal','🥣',8,['microwave','electric-pot','stove'],{oats:50,milk:200},['将燕麦和牛奶倒入微波炉安全大碗，留出防溢空间。','微波炉分段加热并搅拌，或用小锅慢慢煮；根据燕麦包装调整时间。','燕麦变软后稍微放凉再吃。'],['light','lean','normal']);
R('microwave-corn','base','微波炉玉米蛋饭','Corn and egg rice bowl','🍚',8,['microwave'],{ricepack:1,corn:80,egg:1},['把即食米饭和玉米按包装说明分别加热；使用适合微波炉的容器。','把鸡蛋打散放入微波炉安全碗，盖上可排气盖子，分段加热并搅拌至完全凝固。','将所有食材混合，可依个人口味少量调味。'],['normal','lean']);
R('rice-tuna','base','金枪鱼饭团碗','Tuna rice bowl','🍚',5,['microwave'],{ricepack:1,tuna:80,corn:50},['按说明将即食米饭充分加热。','打开金枪鱼罐头并沥去多余汤汁，使用开罐器时小心锋利边缘。','和已加热的玉米混合食用；罐头未用完按标签冷藏。'],['light','normal']);
R('instant-ham','base','火腿肠泡面','Instant noodles with sausage','🍜',8,['electric-pot','stove','induction'],{instant:1,sausage:1,greens:60},['将青菜洗净、火腿肠去包装切片。','按照方便面包装烧水煮面；加入火腿肠及青菜。','继续煮至青菜熟透，适当少放调料包。'],['normal','indulgent'], '',{tier:'easy'});
R('luosifen-crayfish','base','小龙虾螺蛳粉','Luosifen with prepared crayfish','🦞',25,['electric-pot','stove','induction'],{luosifen:1,crayfish:150},['确认预制小龙虾产品已安全保存、仍在有效期内，按包装要求解冻或直接加热。','依螺蛳粉包装煮熟米粉和汤底。','另行按小龙虾包装说明完全加热，然后加入粉中。','小心烫伤；检查对甲壳类海鲜及其他配料有无过敏。'],['indulgent'], '小龙虾产品是否可直接食用或需彻底加热，以真实包装为准。',{tier:'easy'});
R('chicken-rice-air','base','空气炸锅鸡肉饭','Air fryer chicken rice','🍗',28,['air-fryer','microwave'],{chicken:150,ricepack:1,broccoli:120},['洗净并切好西兰花；生鸡肉与蔬菜分开放置及处理。','将鸡肉按合适厚度放入空气炸锅，按设备说明烹饪，使用温度计确认中心充分熟透。','西兰花按设备说明单独加热至熟。','按包装加热即食米饭后组合上桌。'],['normal','lean'],'需要同时有空气炸锅和微波炉。',{requiredTools:['air-fryer','microwave']});
R('fishball-udon','base','鱼丸乌冬汤','Fish ball udon','🍜',15,['electric-pot','stove','induction'],{udon:1,fishballs:120,greens:80},['检查鱼丸包装储存及烹饪说明，必要时依要求解冻。','小锅把水煮至沸腾后加入鱼丸，按包装规定时间煮透。','加入乌冬面及洗净的青菜继续煮熟。','少量调味后盛出。'],['normal','light'],'鱼丸可能含鱼、虾等过敏原。');
R('microwave-soup','base','蘑菇浓汤配吐司','Mushroom soup & toast','🥣',8,['microwave'],{mushroomsoup:1,bread:2},['按罐头说明将浓汤转移到可微波加热的容器。','分段加热并适时搅拌，直到汤完全热透。','搭配吐司食用，注意烫手的容器。'],['light','normal'], '',{tier:'easy'});
R('sweetpotato-air','base','空气炸锅红薯','Air fryer sweet potato','🍠',25,['air-fryer'],{sweetpotato:220},['刷洗红薯外皮，擦干并根据大小切成均匀小块。','平铺在炸篮，按设备说明加热，途中翻动。','用叉子检查中心是否熟软，不熟继续加热。'],['light','normal'], '',{tier:'easy'});
R('microwave-oat-apple','base','苹果燕麦粥','Apple oat bowl','🍎',10,['microwave','electric-pot'],{oats:50,milk:180,apple:1},['苹果清洗后去核切小丁。','燕麦与牛奶放入可微波加热的大碗，加入苹果丁。','分段加热搅拌直至燕麦变软，食用前稍微放凉。'],['light','lean']);
R('bun-steamed','base','速冻包子','Steamed frozen buns','🥟',14,['electric-pot','stove','induction'],{buns:2},['确认锅具配有合适的蒸架与锅盖，不要让包子直接接触加热部件。','将水烧开后按包装要求放入包子、盖上锅盖。','蒸到包装指定时间，并确认内馅彻底热透。'],['normal'], '没有蒸架时请使用包装明确支持的其他加热方式。',{tier:'easy'});
R('rice-tuna-cheese','base','芝士金枪鱼饭','Cheesy tuna rice','🍚',7,['microwave'],{ricepack:1,tuna:80,cheese:1},['即食米饭按包装说明充分加热。','罐头金枪鱼沥干后拌入饭中。','放上芝士片，再短时加热至芝士融化，确保整体热透。'],['indulgent','normal'], '',{tier:'easy'});
R('creamcorn-egg','base','玉米蛋花汤','Cream corn egg soup','🥣',12,['electric-pot','stove','induction'],{creamcorn:1,egg:1},['把罐头玉米羹倒入小锅，按口味加水稀释。','边搅拌边煮至滚开。','鸡蛋打散并缓缓倒入锅中，继续煮到蛋液完全凝固。'],['light','normal']);
R('ham-and-cheese-wrap','base','芝士火腿卷饼','Ham and cheese wrap','🌯',6,['microwave'],{tortillas:1,ham:60,cheese:1},['将卷饼皮放在可微波容器上，火腿和芝士放在中间。','折叠包紧；确认火腿为即食或按包装要求先加热。','微波加热至整体热透，稍微放凉。'],['normal','indulgent'], '',{tier:'easy'});
R('chicken-frozenveg','base','鸡肉蔬菜一锅饭','One pot chicken & vegetables','🍲',28,['electric-pot','stove','induction'],{chicken:140,frozenveg:150,rice:80},['大米淘洗干净，确认电煮锅说明书允许煮饭。','鸡肉切均匀小块并与其他食材分开处理，防止交叉污染。','按设备说明将米饭、鸡肉及蔬菜一起充分煮熟。','使用食品温度计确认鸡肉中心熟透后食用。'],['normal','lean'],'电煮锅不能煮饭时不应推荐此食谱。');
R('udon-kimchi','base','泡菜乌冬面','Kimchi udon','🍜',12,['electric-pot','stove','induction'],{udon:1,kimchi:80,tofu:130},['豆腐切块，泡菜按所需分量取出。','小锅烧水或适量汤底至沸腾，放入乌冬面。','加入泡菜和豆腐，继续加热至汤汁再次滚开。','泡菜本身较咸，可少放其他调料。'],['indulgent','normal']);
R('chickensoup','dish','鸡肉蔬菜汤','Chicken & vegetable soup','🍲',23,['electric-pot','stove','induction'],{chicken:120,carrots:80,cabbage:90},['鸡肉切成薄片，刀具和砧板与即食食物分开使用。','胡萝卜、包菜洗净并切小块。','锅中水烧开后加入鸡肉和胡萝卜，再加入包菜。','持续煮至肉类中心充分熟透、蔬菜变软后调味。'],['light','lean','normal']);
R('egg-cabbage','dish','包菜炒蛋','Cabbage and scrambled eggs','🥚',12,['stove','induction'],{cabbage:150,egg:2,oil:1},['包菜洗净切丝，鸡蛋打散。','适量油入平底锅，倒入鸡蛋炒至完全凝固后盛出。','炒软包菜，加入鸡蛋拌匀，确保菜熟透。'],['normal','lean']);
R('tofu-egg','dish','鸡蛋豆腐羹','Tofu and egg soup','🥣',15,['electric-pot','stove','induction'],{tofu:150,egg:1,scallion:10},['豆腐切小块，葱洗净切碎。','锅中放适量水煮沸，加入豆腐煮热。','倒入打散鸡蛋，继续煮至蛋液完全凝固，最后撒葱。'],['light','lean']);
R('garlic-broccoli','dish','蒜香西兰花','Garlic broccoli','🥦',10,['electric-pot','stove','induction'],{broccoli:180,garlic:8},['西兰花分成小朵并清洗，蒜剥皮切碎。','小锅烧水，煮西兰花到熟软后沥水。','加入蒜末和少量已烧开的水翻拌，按口味调味。'],['light','lean']);
R('potato-curry','dish','土豆咖喱','Potato curry','🍛',22,['electric-pot','stove','induction'],{potato:200,carrots:90,curry:1,onion:40},['土豆、胡萝卜去皮切小块，洋葱切丁。','全部蔬菜放入小锅，加水煮至土豆可以用叉子轻松插入。','关小火后按咖喱块包装说明加入咖喱块，充分搅匀并加热。'],['normal','indulgent']);
R('ham-egg','dish','午餐肉煎蛋','Luncheon meat & egg','🍳',10,['stove','induction'],{ham:80,egg:1,oil:1},['取出午餐肉切薄片，鸡蛋打入碗中。','平底锅放少量油，煎午餐肉至加热透。','将鸡蛋煎至蛋白和蛋黄充分凝固，配主食食用。'],['indulgent','normal']);
R('fishball-soup','dish','鱼丸青菜汤','Fishball & greens soup','🍲',13,['electric-pot','stove','induction'],{fishballs:120,greens:100},['青菜洗净。','锅中水沸腾后加入鱼丸，按照包装要求煮熟。','加入青菜并煮熟，适量调味。'],['light','normal']);
R('shrimp-tofu','dish','虾仁豆腐汤','Shrimp tofu soup','🍤',16,['electric-pot','stove','induction'],{shrimp:110,tofu:130,scallion:10},['按照包装要求安全解冻虾仁，不要在室温长时间放置。','豆腐切块，葱洗净切细。','锅中水烧开，加入虾仁煮至完全不透明、熟透。','加入豆腐继续加热，出锅撒葱。'],['light','lean'],'对甲壳类海鲜过敏的用户不可食用。');
R('cabbage-ham','dish','包菜午餐肉','Cabbage with luncheon meat','🥬',13,['stove','induction'],{cabbage:180,ham:80,oil:1},['包菜洗净切丝，午餐肉切条。','平底锅放少量油先加热午餐肉。','加入包菜继续翻炒至完全熟透。'],['normal','indulgent']);
R('mushroom-cheese','dish','芝士蘑菇','Cheesy mushrooms','🧀',13,['air-fryer'],{mushroom:180,cheese:1},['蘑菇洗净擦干、切成适合大小。','放入空气炸锅可用的耐热容器中，撒上撕碎的芝士片。','按设备说明加热至蘑菇熟透、芝士融化。'],['normal','indulgent']);
R('air-potato','dish','空气炸锅土豆块','Air fryer potato wedges','🥔',20,['air-fryer'],{potato:200,oil:1},['土豆洗净切成差不多大的小块，擦干水分。','加入少量油拌匀，平铺炸篮，不要堆太厚。','按设备说明加热并翻动，直至中心完全熟软。'],['indulgent','normal']);
R('egg-spinach','dish','青菜鸡蛋汤','Greens & egg soup','🥬',11,['electric-pot','stove','induction'],{greens:130,egg:1},['青菜仔细洗净切段。','锅中水烧开后放青菜煮熟。','倒入打散的鸡蛋，煮至蛋花凝固。'],['light','lean']);
R('crayfish-side','dish','加热小龙虾','Prepared crayfish side','🦞',12,['electric-pot','stove','induction'],{crayfish:200},['仔细阅读预制小龙虾包装的加热及安全储存说明。','使用与包装兼容的加热方法将产品完全加热。','确认中心热透后出锅，处理外壳时小心烫伤。'],['indulgent'],'实际加热方式以商品包装为准。');
R('addon-sausage','addon','加一根火腿肠','Add ham sausage','🌭',1,[],{sausage:1},['打开包装，检查是否为即食；如需加热，按照产品说明加热后加入。'],['indulgent','normal']);
R('addon-egg','addon','加一个水煮蛋','Add boiled egg','🥚',9,['electric-pot','stove','induction'],{egg:1},['用小锅水煮鸡蛋至全熟；剥壳后切半放入主食中。'],['normal','light']);
R('addon-cabbage','addon','加一点青菜','Add greens','🥬',3,['electric-pot','stove','induction'],{greens:80},['青菜洗净，加入已煮沸的汤中，煮至熟透。'],['light','normal']);
R('addon-friedegg','addon','少油煎蛋','Pan-fried egg topping','🍳',8,['stove','induction'],{egg:1,oil:1},['使用适合煎蛋的平底锅，锅里放少量油，避免油温过高。','打入鸡蛋，小心油溅，煎至蛋白和蛋黄全熟。','盛出沥去多余油分后放入主食。'],['indulgent','normal'],'这是少油煎蛋，不是需要大量热油的传统炸蛋。');
R('addon-cheese','addon','加一片芝士','Add cheese slice','🧀',1,[],{cheese:1},['把芝士加入热食中，让其融化；需注意奶制品过敏。'],['indulgent','normal']);
R('fries-cheesy','snack','芝士薯条','Cheesy fries','🍟',16,['air-fryer'],{fries:130,cheese:1},['按薯条包装说明用空气炸锅完全加热。','出锅后趁热放芝士片，待融化后食用。'],['indulgent']);
R('frozen-corn-air','snack','空气炸锅甜玉米','Air fryer corn','🌽',12,['air-fryer'],{corn:120,oil:1},['确认冷冻玉米适合该设备、是否需要解冻。','放入耐热容器，适量加一点油。','按包装及设备说明充分加热后食用。'],['light','normal']);
R('yogurt-apple','snack','苹果酸奶杯','Apple & yogurt cup','🍎',3,[],{yogurt:150,apple:1},['苹果洗净、去核切丁。','与原味酸奶混合后立即食用。'],['light','lean']);
R('peanut-toast','snack','花生酱吐司','Peanut butter toast','🍞',2,[],{bread:2,peanutbutter:20},['取两片吐司，均匀涂抹花生酱。','确认没有花生过敏后享用。'],['normal','indulgent']);
R('air-fishballs','snack','空气炸锅鱼丸','Air fryer fish balls','🍢',13,['air-fryer'],{fishballs:140},['必须先确认具体鱼丸商品支持空气炸锅烹饪。','根据该商品包装说明加热，必要时中途翻动。','确认中心完全热透，食用前稍凉。'],['normal'],'若包装不支持此方式，不要使用空气炸锅。');
for(const k of ['luosifen','sausage','crayfish','fishballs','ham','tuna','kimchi','buns','mushroomsoup','creamcorn'])I[k].allergenUnknown=true;
D.catalogStatus='DEMO: locally authored starter meals, not a comprehensive social-media recipe database';
})();
