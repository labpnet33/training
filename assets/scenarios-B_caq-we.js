var e=[{title:{en:`Only a default route`,hi:`Sirf default route`},ticket:{en:`R1, a Level 1 router, must reach the server LAN 172.20.4.10 but you suspect it uses a poor exit. You check its route.`,hi:`R1, ek Level 1 router, ko server LAN 172.20.4.10 tak pahunchna hai par aapko shak hai ki woh kharab exit use karta hai. Aap uska route dekhte ho.`},out:`lab@R1> show route 172.20.4.10
0.0.0.0/0          *[IS-IS/15] 00:01:01, metric 10
                    >  to 10.1.12.2 via ge-0/0/0.0

lab@R1> show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x1   0x3bc9     1140 L1
R2.00-00                         0x1   0xff60     1140 L1 L2 Attached
R3.00-00                         0x1   0x2f8c     1140 L1 L2 Attached`,q:{en:`Why does R1 use R2 for this destination?`,hi:`R1 is destination ke liye R2 kyun use karta hai?`},o:[{en:`R2 has the Overload bit set`,hi:`R2 par Overload bit set hai`},{en:`R1 is Level 2 and prefers R2`,hi:`R1 Level 2 hai aur R2 prefer karta hai`},{en:`Only a default from the Attached bit exists; R2 is the nearest border at metric 10`,hi:`Sirf Attached bit ka default hai; R2 metric 10 par sabse nazdeeki border hai`},{en:`A static route points to R2`,hi:`Static route R2 ki taraf jata hai`}],a:2,w:{en:`Both borders advertise Attached, and R1 has no specific route. It picks the nearest border without knowing the cost of the uplink beyond it. Leaking the prefix fixes that.`,hi:`Dono borders Attached advertise karte hain, aur R1 ke paas specific route nahi hai. Woh bina uske aage ke uplink ka cost jane sabse nazdeeki border chunta hai. Prefix leak karne se yeh theek hota hai.`}},{title:{en:`A router is being drained`,hi:`Router drain ho raha hai`},ticket:{en:`Before maintenance on R2 an engineer enabled one setting. You check the Jaipur ring from R1 and the path to R3 changed.`,hi:`R2 par maintenance se pehle engineer ne ek setting enable ki. Aap R1 se Jaipur ring check karte ho aur R3 ka path badal gaya hai.`},out:`lab@R1> show isis database
IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x1   0x65d1     1131 L1 L2
R2.00-00                         0x2   0x4c9a     1194 L1 L2 Overload
R3.00-00                         0x1   0xb450     1131 L1 L2
R4.00-00                         0x1   0x1fc3     1131 L1 L2

lab@R1> show route 10.7.255.3
10.7.255.3/32      *[IS-IS/18] 00:00:05, metric 60
                    >  to 10.7.14.4 via ge-0/0/1.0`,q:{en:`What explains the new path through R4?`,hi:`R4 ke through naya path kya samjhata hai?`},o:[{en:`R2 advertises the overload bit, so it is no longer used as a transit hop`,hi:`R2 overload bit advertise karta hai, isliye ab transit hop ki tarah use nahi hota`},{en:`The R1 to R2 link went down`,hi:`R1 se R2 link down ho gaya`},{en:`R3 changed its area`,hi:`R3 ne apna area badla`},{en:`Wide metrics were turned off`,hi:`Wide metrics band kar diye gaye`}],a:0,w:{en:`The Overload attribute on R2.00-00 makes neighbours skip it for transit. The metric to R3 rises from 20 to 60 (30 plus 30 via R4), while R2 stays reachable as a destination.`,hi:`R2.00-00 par Overload attribute neighbours ko transit ke liye use skip karne par majboor karta hai. R3 tak metric 20 se 60 (R4 ke through 30 plus 30) ho jata hai, jabki R2 destination ke roop mein reachable rehta hai.`}},{title:{en:`Empty adjacency table`,hi:`Khaali adjacency table`},ticket:{en:`After a change on R1, show isis adjacency is empty and the log reports lost adjacencies. This is the overview and log from R1.`,hi:`R1 par change ke baad show isis adjacency khaali hai aur log lost adjacencies batata hai. Yeh R1 ka overview aur log hai.`},out:`lab@R1> show isis overview
  Sysid: 0100.0125.5001
  Areaid: 49.0009
  Level 1
    Internal route preference: 15
  Level 2
    Disabled

lab@R1> show log messages | last 3
Oct  1 23:57:31  R1 mgd[1147]: UI_COMMIT: User 'lab' requested 'commit' operation
Oct  1 23:57:49  R1 rpd[1140]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R2 on ge-0/0/0.0, reason: Hold Time Expired
Oct  1 23:57:53  R1 rpd[1140]: RPD_ISIS_ADJDOWN: IS-IS lost L1 adjacency to R3 on ge-0/0/1.0, reason: Hold Time Expired`,q:{en:`What is the most likely cause and the quickest fix?`,hi:`Sabse sambhavit cause aur sabse tez fix kya hai?`},o:[{en:`The interface MTU is wrong; raise it`,hi:`Interface MTU galat hai; badhao`},{en:`The metric style is wrong; use narrow`,hi:`Metric style galat hai; narrow use karo`},{en:`Overload is set; remove it`,hi:`Overload set hai; hata do`},{en:`The NET area changed to 49.0009 on a Level 1-only router; roll back the change`,hi:`Level 1-only router par NET area 49.0009 ho gaya; change rollback karo`}],a:3,w:{en:`The Areaid is 49.0009 and R1 runs only Level 1, so neighbours in 49.0001 no longer match. The commit appears just before the adjacencies drop. A rollback restores the NET.`,hi:`Areaid 49.0009 hai aur R1 sirf Level 1 chalata hai, isliye 49.0001 ke neighbours ab match nahi karte. Commit adjacencies girne se theek pehle dikhta hai. Rollback NET wapas karta hai.`}},{title:{en:`What does Down mean here?`,hi:`Yahan Down ka kya matlab hai?`},ticket:{en:`A junior reads this database detail on R1 after a leak policy was committed and asks if the prefix is unreachable.`,hi:`Leak policy commit hone ke baad ek junior R1 par yeh database detail padhta hai aur poochta hai ki prefix unreachable hai kya.`},out:`lab@R1> show isis database detail
R2.00-00 Sequence: 0x2, Checksum: 0xb977, Lifetime: 1148 secs
   IS neighbor: R1.00                          Metric:       10
   IP prefix: 10.1.255.2/32                    Metric:        0 Internal Up
   IP prefix: 172.20.4.0/24                    Metric:      110 Internal Down
R3.00-00 Sequence: 0x2, Checksum: 0x24b3, Lifetime: 1152 secs
   IP prefix: 172.20.4.0/24                    Metric:       20 Internal Down`,q:{en:`What does Down on 172.20.4.0/24 mean?`,hi:`172.20.4.0/24 par Down ka kya matlab hai?`},o:[{en:`The prefix is unreachable`,hi:`Prefix unreachable hai`},{en:`The route came down from Level 2 and must not be advertised back up`,hi:`Route Level 2 se neeche aaya hai aur use wapas upar advertise nahi karna chahiye`},{en:`The link to the server is down`,hi:`Server ka link down hai`},{en:`The prefix has an overload flag`,hi:`Prefix par overload flag hai`}],a:1,w:{en:`The up/down bit marks leaked routes so borders do not send them back into Level 2. The sequence 0x2 shows both borders re-originated their LSPs for the leak.`,hi:`Up/down bit leak hue routes ko mark karta hai taaki borders unhe wapas Level 2 mein na bhejein. Sequence 0x2 dikhata hai ki dono borders ne leak ke liye apne LSPs dobara banaye.`}},{title:{en:`Pingable but missing`,hi:`Pingable par missing`},ticket:{en:`The R1 to R2 link responds to ping, but after a cleanup R1 has only one IS-IS neighbour. This is what R1 shows.`,hi:`R1 se R2 link ping ka jawab deta hai, par cleanup ke baad R1 ka sirf ek IS-IS neighbour hai. R1 yeh dikhata hai.`},out:`lab@R1> show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/1.0            R3             1 Up                   19

lab@R1> show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/1.0            1   0x2 Point to Point    Disabled                 20/10
lo0.0                 0   0x7 Passive           Disabled                   0/0`,q:{en:`What was removed?`,hi:`Kya hataya gaya?`},o:[{en:`The NET on lo0`,hi:`lo0 ka NET`},{en:`The export policy`,hi:`Export policy`},{en:`Level 1 on R2`,hi:`R2 par Level 1`},{en:`Family iso on ge-0/0/0`,hi:`ge-0/0/0 se family iso`}],a:3,w:{en:`ge-0/0/0.0 is not in the interface database at all, which points to the missing iso family. With the NET removed, no adjacency would exist on any interface.`,hi:`ge-0/0/0.0 interface database mein hai hi nahi, jo missing iso family ki taraf ishara karta hai. NET hat jata to kisi bhi interface par adjacency nahi hoti.`}},{title:{en:`Why 165 and 61?`,hi:`165 aur 61 kyun?`},ticket:{en:`After redistribution on R3, R1 learns the OSPF-only router R5. An auditor asks why the preference is 165 and not 18.`,hi:`R3 par redistribution ke baad R1 OSPF-only router R5 ko seekhta hai. Auditor poochta hai ki preference 18 ki jagah 165 kyun hai.`},out:`lab@R1> show route protocol isis
10.7.255.4/32      *[IS-IS/18] 00:01:47, metric 30
                    >  to 10.7.14.4 via ge-0/0/1.0
10.7.255.5/32      *[IS-IS/165] 00:00:31, metric 61
                    >  to 10.7.14.4 via ge-0/0/1.0

lab@R1> show isis database detail
R3.00-00 Sequence: 0x2, Checksum: 0x7421, Lifetime: 1168 secs
   IP prefix: 10.7.255.3/32                    Metric:        0 Internal Up
   IP prefix: 10.7.255.5/32                    Metric:        1 External Up`,q:{en:`What is the explanation?`,hi:`Explanation kya hai?`},o:[{en:`R3 exported it with an export policy, so it is an External Level 2 route (165) with metric 1 added to the cost of 60 to R3`,hi:`R3 ne use export policy se export kiya, isliye yeh External Level 2 route (165) hai aur R3 tak ke cost 60 mein metric 1 judta hai`},{en:`R1 is Level 1 so it uses 165`,hi:`R1 Level 1 hai isliye 165 use karta hai`},{en:`Narrow metrics force 165`,hi:`Narrow metrics 165 force karte hain`},{en:`The route came from a static route on R1`,hi:`Route R1 ke static route se aaya`}],a:0,w:{en:`The LSP marks the prefix External. External Level 2 routes get preference 165, and the metric is the path cost to R3 (60 with R2 overloaded) plus the exported metric 1, giving 61.`,hi:`LSP prefix ko External mark karta hai. External Level 2 routes ko preference 165 milti hai, aur metric R3 tak ka path cost (R2 overloaded ho to 60) plus exported metric 1 hota hai, yani 61.`}},{title:{en:`Which border wins the leak?`,hi:`Leak mein kaunsa border jeetta hai?`},ticket:{en:`Both borders leak 172.20.4.0/24 with different metrics. R1 has a link metric of 10 to R2 and 20 to R3. A colleague expects R2 because it is closer.`,hi:`Dono borders 172.20.4.0/24 alag metrics ke saath leak karte hain. R1 ka R2 tak link metric 10 aur R3 tak 20 hai. Ek colleague R2 expect karta hai kyunki woh nazdeek hai.`},out:`R2.00-00  IP prefix: 172.20.4.0/24   Metric:      110 Internal Down
R3.00-00  IP prefix: 172.20.4.0/24   Metric:       20 Internal Down

lab@R1> show route 172.20.4.10
172.20.4.0/24      *[IS-IS/15] 00:00:47, metric 40
                    >  to 10.1.13.3 via ge-0/0/1.0`,q:{en:`Why does R1 choose R3?`,hi:`R1 R3 kyun chunta hai?`},o:[{en:`R3 has a lower system ID`,hi:`R3 ka system ID chhota hai`},{en:`R2 is overloaded`,hi:`R2 overloaded hai`},{en:`Total cost via R3 is 20 plus 20 equals 40; via R2 it is 10 plus 110 equals 120`,hi:`R3 ke through total cost 20 plus 20 barabar 40; R2 ke through 10 plus 110 barabar 120`},{en:`Down routes prefer the higher metric`,hi:`Down routes ucha metric prefer karte hain`}],a:2,w:{en:`IS-IS adds the link cost to the advertised metric. The slow uplink on R2 (100) makes its advertisement 110, so the nearer border is the worse exit.`,hi:`IS-IS link cost ko advertised metric mein jodta hai. R2 ka dheema uplink (100) uske advertisement ko 110 bana deta hai, isliye nazdeeki border kharab exit hai.`}}];export{e as default};