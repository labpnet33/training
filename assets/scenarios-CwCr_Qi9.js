var e=[{title:{en:`The interface that is not there`,hi:`Wo interface jo hai hi nahi`},ticket:{en:`R2 has ge-0/0/1.0 under protocols isis and the commit worked, but the neighbour R3 never appears. Read the output from R2.`,hi:`R2 par ge-0/0/1.0 protocols isis ke neeche hai aur commit ho gaya, par neighbour R3 kabhi nahi dikhta. R2 ka output padho.`},out:`lab@R2> show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 Point to Point    Point to Point           10/10
lo0.0                 0   0x7 Passive           Passive                    0/0

lab@R2> show isis adjacency
(no output)`,q:{en:`What is the most likely fix?`,hi:`Sabse sambhavit fix kya hai?`},o:[{en:`Add family iso on ge-0/0/1 unit 0`,hi:`ge-0/0/1 unit 0 par family iso lagao`},{en:`Change the hello interval`,hi:`Hello interval badlo`},{en:`Raise the DIS priority`,hi:`DIS priority badhao`},{en:`Enable wide metrics`,hi:`Wide metrics enable karo`}],a:0,w:{en:`The interface is listed under protocols isis but is absent from show isis interface. Without family iso on the unit, no hellos are sent and the commit raises no error.`,hi:`Interface protocols isis ke neeche listed hai par show isis interface mein nahi hai. Unit par family iso ke bina hellos nahi jaate aur commit koi error nahi deta.`}},{title:{en:`Wrong area, no adjacency`,hi:`Galat area, adjacency nahi`},ticket:{en:`R1 is an L1-only router. The design says area 49.0001, which R2 uses. R1 shows no adjacency. Read the overview.`,hi:`R1 L1-only router hai. Design mein area 49.0001 hai, jo R2 use karta hai. R1 par adjacency nahi dikhti. Overview padho.`},out:`lab@R1> show isis overview
  Sysid: 0100.3025.5001
  Areaid: 49.0010
  Level 1
    Internal route preference: 15
  Level 2
    Disabled

lab@R1> show isis adjacency
(no output)`,q:{en:`Why does the adjacency not form?`,hi:`Adjacency kyun nahi banti?`},o:[{en:`The LSP lifetime is 1200`,hi:`LSP lifetime 1200 hai`},{en:`Level 1 adjacency needs the same area, and level 2 is disabled on R1`,hi:`Level 1 adjacency ko same area chahiye, aur R1 par level 2 disabled hai`},{en:`The metric is too low`,hi:`Metric bahut kam hai`},{en:`The preference is 15`,hi:`Preference 15 hai`}],a:1,w:{en:`R1 is in area 49.0010 and R2 in 49.0001. Level 1 neighbours must share the area, and with level 2 disabled R1 cannot form a level 2 adjacency instead. Fix the area in the NET on lo0.`,hi:`R1 area 49.0010 mein hai aur R2 49.0001 mein. Level 1 neighbours ka area same hona chahiye, aur level 2 disabled hone se R1 level 2 adjacency bhi nahi bana sakta. lo0 ke NET mein area theek karo.`}},{title:{en:`The key that looks right`,hi:`Wo key jo sahi lagti hai`},ticket:{en:`Both engineers say the level 2 hello key is the same, but the R2-R3 link is empty. Read the configuration on R3.`,hi:`Dono engineers kehte hain level 2 hello key same hai, par R2-R3 link khaali hai. R3 ki configuration padho.`},out:`lab@R3> show configuration protocols isis
interface ge-0/0/0.0 {
    point-to-point;
    level 2 {
        hello-authentication-key pune-l2; ## SECRET-DATA
        hello-authentication-type md5;
    }
}
lab@R3> show isis adjacency
(no output)`,q:{en:`R2 expects Pune-L2. What is the right action?`,hi:`R2 Pune-L2 expect karta hai. Sahi action kya hai?`},o:[{en:`Re-enter the agreed key with the exact case on R3 and commit`,hi:`R3 par agreed key exact case ke saath dobara enter karo aur commit karo`},{en:`Delete the level 2 configuration on both routers`,hi:`Dono routers par level 2 configuration delete karo`},{en:`Change the IS-IS metric`,hi:`IS-IS metric badlo`},{en:`Set the overload bit`,hi:`Overload bit set karo`}],a:0,w:{en:`IS-IS keys are case sensitive. The key pune-l2 does not match Pune-L2, so the MD5 digest on the hello fails and the neighbour is ignored. Re-entering the key fixes it and keeps authentication on.`,hi:`IS-IS keys case sensitive hain. Key pune-l2 Pune-L2 se match nahi karti, isliye hello ka MD5 digest fail hota hai aur neighbour ignore hota hai. Key dobara enter karne se fix hota hai aur authentication on rehta hai.`}},{title:{en:`Where does the default come from?`,hi:`Default kahan se aaya?`},ticket:{en:`R1 is a level 1 router with no route to the server LAN 172.30.3.0/24, yet its ping works. Read the routes on R1 and the database on R2.`,hi:`R1 level 1 router hai aur server LAN 172.30.3.0/24 ka route nahi, phir bhi ping chalta hai. R1 ke routes aur R2 ka database padho.`},out:`lab@R2> show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x2   0x6235     1084 L1
R2.00-00                         0x4   0x3eef     1143 L1 L2 Attached

lab@R1> show route protocol isis
0.0.0.0/0          *[IS-IS/15] 00:00:57, metric 10
10.30.23.0/24      *[IS-IS/15] 00:01:56, metric 20
10.30.255.2/32     *[IS-IS/15] 00:01:56, metric 10`,q:{en:`What produces the default route on R1?`,hi:`R1 par default route kaun banata hai?`},o:[{en:`A static route on R1`,hi:`R1 par static route`},{en:`The overload bit on R2`,hi:`R2 par overload bit`},{en:`The DIS pseudonode`,hi:`DIS pseudonode`},{en:`The ATT bit set by the L1/L2 router R2`,hi:`L1/L2 router R2 ka set kiya hua ATT bit`}],a:3,w:{en:`R2 has a level 2 adjacency to another area, so its level 1 LSP carries the Attached attribute. R1 installs 0.0.0.0/0 with preference 15 toward R2.`,hi:`R2 ka doosre area ke saath level 2 adjacency hai, isliye uske level 1 LSP mein Attached attribute hai. R1 R2 ki taraf preference 15 ke saath 0.0.0.0/0 install karta hai.`}},{title:{en:`Drain before patching`,hi:`Patching se pehle drain`},ticket:{en:`You must patch R2 without dropping transit traffic. You set one command and look at the database. Read it.`,hi:`R2 ko transit traffic girane ke bina patch karna hai. Aap ek command set karte ho aur database dekhte ho. Padho.`},out:`lab@R2> show isis overview
  Overload bit: set

lab@R2> show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R2.00-00                         0x2   0xac17     1170 L1 L2 Overload
IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R2.00-00                         0x2   0x3bd8     1170 L1 L2 Overload`,q:{en:`What does Overload mean for the other routers?`,hi:`Doosre routers ke liye Overload ka kya matlab hai?`},o:[{en:`Do not use R2 for transit; R2 own prefixes stay reachable`,hi:`R2 ko transit ke liye use mat karo; R2 ke apne prefixes reachable rehte hain`},{en:`R2 is shut down`,hi:`R2 band ho gaya`},{en:`R2 became the DIS`,hi:`R2 DIS ban gaya`},{en:`R2 leaks level 2 routes`,hi:`R2 level 2 routes leak karta hai`}],a:0,w:{en:`The overload bit removes the transit role only. Neighbours keep R2 in the database but do not run SPF through it. Remove the bit after the work.`,hi:`Overload bit sirf transit role hatata hai. Neighbours R2 ko database mein rakhte hain par uske through SPF nahi chalate. Kaam ke baad bit hata do.`}},{title:{en:`A leaked loopback`,hi:`Leak hua loopback`},ticket:{en:`After a policy was added on R2, R1 has an exact route to the loopback of R3 in another area. Read the LSP of R2.`,hi:`R2 par policy lagane ke baad R1 ke paas doosre area ke R3 ke loopback ka exact route hai. R2 ka LSP padho.`},out:`lab@R1> show isis database detail
R2.00-00 Sequence: 0x5, Checksum: 0x306a, Lifetime: 1160 secs
   IP prefix: 10.30.255.2/32                   Metric:        0 Internal Up
   IP prefix: 10.30.255.3/32                   Metric:       10 Internal Down

lab@R1> show route 10.30.255.3
10.30.255.3/32     *[IS-IS/15] 00:00:40, metric 20`,q:{en:`What does the Down marking tell you?`,hi:`Down marking kya batati hai?`},o:[{en:`The route has preference 160`,hi:`Route ki preference 160 hai`},{en:`The prefix was leaked from level 2 to level 1 and must not return to level 2`,hi:`Prefix level 2 se level 1 mein leak hua aur level 2 mein wapas nahi jaana chahiye`},{en:`The prefix is unreachable`,hi:`Prefix unreachable hai`},{en:`The interface is administratively down`,hi:`Interface administratively down hai`}],a:1,w:{en:`The up/down bit marks routes that went down a level. It prevents loops when several L1/L2 routers exist. The route still works: R1 uses it with preference 15.`,hi:`Up/down bit un routes ko mark karta hai jo ek level neeche aaye. Ye kai L1/L2 routers hone par loops rokta hai. Route phir bhi kaam karta hai: R1 use preference 15 ke saath use karta hai.`}},{title:{en:`The DIS that changed`,hi:`DIS jo badal gaya`},ticket:{en:`On a LAN with R1, R2 and R3, R2 was the DIS (pseudonode R2.01). After R1 was set to priority 100 the pseudonode became R1.01. Read the outputs.`,hi:`R1, R2 aur R3 wale LAN par R2 DIS tha (pseudonode R2.01). R1 ko priority 100 par set karne ke baad pseudonode R1.01 ho gaya. Outputs padho.`},out:`lab@R2> show isis interface
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 R2.01             R2.01                    10/10

lab@R1> show isis interface
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 R1.01             R1.01                    10/10`,q:{en:`Why did the DIS change immediately?`,hi:`DIS turant kyun badla?`},o:[{en:`R2 failed`,hi:`R2 fail ho gaya`},{en:`The area ID changed`,hi:`Area ID badal gaya`},{en:`The DIS election is preemptive: a higher priority router takes over`,hi:`DIS election preemptive hai: higher priority wala router le leta hai`},{en:`A BDIS was promoted`,hi:`BDIS ko promote kiya gaya`}],a:2,w:{en:`IS-IS has no backup DIS and the election is preemptive. R1 with priority 100 beats the default 64, and the network creates a new pseudonode LSP R1.01.`,hi:`IS-IS mein backup DIS nahi hota aur election preemptive hai. Priority 100 wala R1 default 64 ko harata hai, aur network naya pseudonode LSP R1.01 banata hai.`}}];export{e as default};