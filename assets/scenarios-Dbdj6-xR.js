var e=[{title:{en:`Metric tuning gone wrong`,hi:`Metric tuning ulta pad gaya`},ticket:{en:`After a "metric tuning" change window, the Kolkata branch (R1) lost every route to the Chennai campus (R3). The consoles keep printing DUAL messages. You collect this.`,hi:`"Metric tuning" change window ke baad Kolkata branch (R1) ne Chennai campus (R3) ke saare routes kho diye. Consoles par baar baar DUAL messages aa rahe hain. Aap yeh collect karte ho.`},out:`R1#
%DUAL-5-NBRCHANGE: EIGRP-IPv4 200: Neighbor 10.9.12.2 (GigabitEthernet0/0) is down: K-value mismatch
R3#
%DUAL-5-NBRCHANGE: EIGRP-IPv4 200: Neighbor 10.9.23.2 (GigabitEthernet0/0) is down: K-value mismatch

R1#show ip protocols | include weight
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0
R2#show ip protocols | include weight
    Metric weight K1=1, K2=1, K3=1, K4=0, K5=0
R3#show ip protocols | include weight
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Change the AS number on R1 and R3 to match R2`,hi:`R1 aur R3 ka AS number R2 se match karwao`},{en:`On R2: router eigrp 200, then no metric weights`,hi:`R2 par: router eigrp 200, phir no metric weights`},{en:`Set the same hello interval on all three routers`,hi:`Teeno routers par same hello interval set karo`},{en:`Run clear ip eigrp neighbors on R1 and R3`,hi:`R1 aur R3 par clear ip eigrp neighbors chalao`}],a:1,w:{en:`Both R1 and R3 log the mismatch against R2, and only R2 shows K2=1. Restoring the default K values on R2 (no metric weights, or metric weights 0 1 0 1 0 0) brings both adjacencies back within a hello interval. Clearing neighbours changes nothing because the Hellos still carry different K values; timers need not match in EIGRP.`,hi:`R1 aur R3 dono R2 ke against mismatch log karte hain, aur sirf R2 par K2=1 hai. R2 par default K values wapas laane se (no metric weights, ya metric weights 0 1 0 1 0 0) ek hello interval mein dono adjacencies wapas aa jaati hain. Neighbours clear karne se kuch nahi badalta kyunki Hellos mein ab bhi alag K values hain; EIGRP mein timers match hona zaroori nahi.`}},{title:{en:`Neighbours up, LAN still missing`,hi:`Neighbours up, LAN ab bhi gaayab`},ticket:{en:`The K values are fixed and R2 is neighbours with R1 and R3 again. R1 now has routes to 10.9.23.0/24 and 3.3.3.3, but users in Kolkata still cannot reach the Chennai LAN 192.168.3.0/24. You check R3.`,hi:`K values theek ho gayi aur R2 phir se R1 aur R3 ka neighbour hai. R1 ke paas ab 10.9.23.0/24 aur 3.3.3.3 ke routes hain, lekin Kolkata ke users ab bhi Chennai LAN 192.168.3.0/24 tak nahi pahunch pa rahe. Aap R3 check karte ho.`},out:`R3#show ip protocols
Routing Protocol is "eigrp 200"
  EIGRP-IPv4 Protocol for AS(200)
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0
    Router-ID: 3.3.3.3
  Automatic Summarization: disabled
  Routing for Networks:
    3.3.3.3/32
    10.9.23.0/24
  Passive Interface(s):
    GigabitEthernet0/1
  Routing Information Sources:
    Gateway         Distance      Last Update
    10.9.23.2             90      00:01:05

R3#show ip interface brief | include GigabitEthernet0/1
GigabitEthernet0/1     192.168.3.1     YES manual up                    up`,q:{en:`Why is 192.168.3.0/24 not advertised?`,hi:`192.168.3.0/24 advertise kyun nahi ho raha?`},o:[{en:`A passive interface never advertises its subnet`,hi:`Passive interface kabhi apna subnet advertise nahi karta`},{en:`The LAN needs a neighbour before it can be advertised`,hi:`LAN ko advertise hone se pehle ek neighbour chahiye`},{en:`Auto-summary is hiding the /24`,hi:`Auto-summary /24 ko chhupa raha hai`},{en:`No network statement covers 192.168.3.1, so Gi0/1 is not in EIGRP at all`,hi:`Koi network statement 192.168.3.1 ko cover nahi karta, isliye Gi0/1 EIGRP mein hai hi nahi`}],a:3,w:{en:`Passive-interface only stops Hellos; the subnet is advertised when a network statement covers the interface. R3's networks are 3.3.3.3/32 and 10.9.23.0/24 only. Adding network 192.168.3.0 0.0.0.255 makes R1 learn D 192.168.3.0/24, while Gi0/1 stays passive. Auto-summary is disabled.`,hi:`Passive-interface sirf Hellos rokta hai; subnet tab advertise hota hai jab koi network statement interface ko cover kare. R3 ke networks sirf 3.3.3.3/32 aur 10.9.23.0/24 hain. network 192.168.3.0 0.0.0.255 jodne se R1, D 192.168.3.0/24 seekh leta hai, aur Gi0/1 passive hi rehta hai. Auto-summary disabled hai.`}},{title:{en:`Which path is the backup?`,hi:`Backup kaunsa path hai?`},ticket:{en:`Jaipur (R1) reaches the Noida data centre LAN through the core router R2, with a 10 Mbps backup link straight to R3. The change board wants to know which neighbour will take over instantly if the R1 to R2 link fails.`,hi:`Jaipur (R1) Noida data centre LAN tak core router R2 se pahunchta hai, R3 tak seedhe 10 Mbps backup link ke saath. Change board jaanna chahta hai ki R1 se R2 link fail hone par kaunsa neighbour turant sambhalega.`},out:`R1#show ip eigrp topology 192.168.30.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(1.1.1.1) for 192.168.30.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 3328
  Descriptor Blocks:
  10.0.12.2 (GigabitEthernet0/0), from 10.0.12.2, Send flag is 0x0
      Composite metric is (3328/3072), route is Internal
  10.0.13.3 (GigabitEthernet0/1), from 10.0.13.3, Send flag is 0x0
      Composite metric is (256512/2816), route is Internal`,q:{en:`Which next hop is the feasible successor?`,hi:`Feasible successor kaunsa next hop hai?`},o:[{en:`10.0.13.3, because its RD 2816 is less than the FD 3328`,hi:`10.0.13.3, kyunki uska RD 2816, FD 3328 se kam hai`},{en:`10.0.12.2, because it has the lowest metric`,hi:`10.0.12.2, kyunki uska metric sabse kam hai`},{en:`None, because 256512 is greater than 3328`,hi:`Koi nahi, kyunki 256512, 3328 se bada hai`},{en:`10.0.23.3, R3's address on the core link`,hi:`10.0.23.3, core link par R3 ka address`}],a:0,w:{en:`10.0.12.2 is the successor (lowest total, FD 3328). The feasibility condition compares the neighbour's reported distance with the FD, not the total metric: 2816 is less than 3328, so 10.0.13.3 is a loop-free feasible successor and will be promoted instantly without Queries.`,hi:`10.0.12.2 successor hai (sabse kam total, FD 3328). Feasibility condition neighbour ke reported distance ko FD se compare karti hai, total metric ko nahi: 2816, 3328 se kam hai, isliye 10.0.13.3 loop-free feasible successor hai aur bina Queries ke turant promote hoga.`}},{title:{en:`The idle ISP link`,hi:`Khaali ISP link`},ticket:{en:`The Pune office (R1) pays for two ISP paths to the Mumbai servers, but all traffic uses R2. Management asks you to use both links, in proportion to their quality, with the least aggressive setting.`,hi:`Pune office (R1) Mumbai servers tak do ISP paths ke paise deta hai, lekin saara traffic R2 use karta hai. Management chahta hai ki dono links unki quality ke anupaat mein use hon, sabse kam aggressive setting ke saath.`},out:`R1#show ip eigrp topology 172.16.4.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(1.1.1.1) for 172.16.4.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 3328
  Descriptor Blocks:
  10.1.12.2 (GigabitEthernet0/0), from 10.1.12.2, Send flag is 0x0
      Composite metric is (3328/3072), route is Internal
  10.1.13.3 (GigabitEthernet0/1), from 10.1.13.3, Send flag is 0x0
      Composite metric is (8192/3072), route is Internal

R1#show ip protocols | include variance
      Maximum metric variance 1`,q:{en:`What is the smallest variance that installs both paths?`,hi:`Dono paths install karne wala sabse chhota variance kya hai?`},o:[{en:`1`,hi:`1`},{en:`2`,hi:`2`},{en:`3`,hi:`3`},{en:`4`,hi:`4`}],a:2,w:{en:`The R3 path is a feasible successor (3072 is less than 3328). Its metric 8192 must be below variance x FD: 2 x 3328 = 6656 is too small, 3 x 3328 = 9984 is enough. With variance 3, show ip route 172.16.4.0 shows traffic share counts 2 (via R2) and 1 (via R3).`,hi:`R3 path feasible successor hai (3072, 3328 se kam). Uska metric 8192 variance x FD se kam hona chahiye: 2 x 3328 = 6656 chhota hai, 3 x 3328 = 9984 kaafi hai. Variance 3 ke saath show ip route 172.16.4.0 traffic share counts 2 (R2 se) aur 1 (R3 se) dikhata hai.`}},{title:{en:`Variance that does nothing`,hi:`Variance jo kuch nahi karta`},ticket:{en:`A colleague set variance 4 on R1 to load-share to R2's loopback 2.2.2.2 over both links. The routing table still shows only one path, and the colleague suspects a bug.`,hi:`Ek colleague ne R1 par variance 4 set kiya taaki R2 ke loopback 2.2.2.2 tak dono links par load-share ho. Routing table ab bhi sirf ek path dikhati hai, aur colleague ko bug ka shak hai.`},out:`R1#show ip protocols | include variance
      Maximum metric variance 4

R1#show ip eigrp topology all-links
P 2.2.2.2/32, 1 successors, FD is 130816, serno 3
        via 10.0.12.2 (130816/128256), GigabitEthernet0/0
        via 10.0.13.3 (384512/130816), GigabitEthernet0/1

R1#show ip route 2.2.2.2 | include via
  Known via "eigrp 100", distance 90, metric 130816, type internal
  * 10.0.12.2, from 10.0.12.2, 00:04:10 ago, via GigabitEthernet0/0`,q:{en:`Why is the path via 10.0.13.3 not installed?`,hi:`10.0.13.3 wala path install kyun nahi hua?`},o:[{en:`384512 is greater than 4 x 130816`,hi:`384512, 4 x 130816 se bada hai`},{en:`maximum-paths is set to 1`,hi:`maximum-paths 1 par set hai`},{en:`Variance only works in named mode`,hi:`Variance sirf named mode mein kaam karta hai`},{en:`Its RD 130816 is not less than the FD 130816, so it is not a feasible successor`,hi:`Uska RD 130816, FD 130816 se kam nahi hai, isliye woh feasible successor nahi hai`}],a:3,w:{en:`4 x 130816 = 523264, so the metric would fit. But variance only installs feasible successors, and the condition is strictly RD less than FD. R3 reports exactly the FD, so the path fails (it appears only with all-links). No variance value can fix that; only changing the metrics (for example delay) could make it an FS.`,hi:`4 x 130816 = 523264, isliye metric fit ho jaata. Lekin variance sirf feasible successors install karta hai, aur condition strictly RD FD se kam hai. R3 bilkul FD report karta hai, isliye path fail hota hai (sirf all-links ke saath dikhta hai). Koi variance value ise theek nahi kar sakti; sirf metrics badalne se (jaise delay) yeh FS ban sakta hai.`}},{title:{en:`Silent new router`,hi:`Chup naya router`},ticket:{en:`A new branch router R1 was staged from a template and connected to R2. Pings across 10.0.12.0/24 work, but no EIGRP neighbour forms and there are no DUAL messages in the log at all.`,hi:`Ek naya branch router R1 template se stage karke R2 se joda gaya. 10.0.12.0/24 ke paar ping chalta hai, lekin koi EIGRP neighbour nahi banta aur log mein bilkul koi DUAL message nahi hai.`},out:`R1#show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(101)

R1#show ip protocols | include Routing Protocol
Routing Protocol is "eigrp 101"
R2#show ip protocols | include Routing Protocol
Routing Protocol is "eigrp 100"

R1#show ip eigrp interfaces
EIGRP-IPv4 Interfaces for AS(101)
                              Xmit Queue   PeerQ        Mean   Pacing Time   Multicast    Pending
Interface              Peers  Un/Reliable  Un/Reliable  SRTT   Un/Reliable   Flow Timer   Routes
Gi0/0                    0        0/0       0/0           0       0/0            0           0

R1#ping 10.0.12.2
!!!!!`,q:{en:`What is the cause?`,hi:`Cause kya hai?`},o:[{en:`AS mismatch: R1 runs EIGRP 101 and R2 runs EIGRP 100; Hellos from another AS are silently ignored`,hi:`AS mismatch: R1 EIGRP 101 aur R2 EIGRP 100 chalata hai; doosre AS ke Hellos chupchaap ignore hote hain`},{en:`Gi0/0 is passive on R1`,hi:`R1 par Gi0/0 passive hai`},{en:`K-value mismatch`,hi:`K-value mismatch`},{en:`Hello timers differ between R1 and R2`,hi:`R1 aur R2 ke hello timers alag hain`}],a:0,w:{en:`Gi0/0 is listed in show ip eigrp interfaces, so it is not passive; a K mismatch would log loudly; timers need not match. The process numbers differ (101 vs 100), and an AS mismatch produces no log message. Recreate the process as router eigrp 100 on R1.`,hi:`Gi0/0 show ip eigrp interfaces mein listed hai, isliye passive nahi; K mismatch zor se log karta; timers match hona zaroori nahi. Process numbers alag hain (101 vs 100), aur AS mismatch koi log message nahi deta. R1 par process ko router eigrp 100 ke roop mein dobara banao.`}},{title:{en:`Saving bandwidth, losing the neighbour`,hi:`Bandwidth bachaya, neighbour khoya`},ticket:{en:`To "reduce overhead", an engineer changed the EIGRP hello interval on R1 Gi0/0. Since then the adjacency to R2 flaps every few seconds.`,hi:`"Overhead kam karne" ke liye ek engineer ne R1 Gi0/0 par EIGRP hello interval badla. Tab se R2 ke saath adjacency har kuch second flap karti hai.`},out:`R2#show logging | include NBRCHANGE
%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.0.12.1 (GigabitEthernet0/0) is down: holding time expired
%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.0.12.1 (GigabitEthernet0/0) is up: new adjacency
%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.0.12.1 (GigabitEthernet0/0) is down: holding time expired
%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.0.12.1 (GigabitEthernet0/0) is up: new adjacency

R1#show running-config interface GigabitEthernet0/0
interface GigabitEthernet0/0
 description to R2
 ip address 10.0.12.1 255.255.255.0
 ip hello-interval eigrp 100 20`,q:{en:`What is the best explanation and fix?`,hi:`Sabse achha explanation aur fix kya hai?`},o:[{en:`Timers must match: set ip hello-interval eigrp 100 20 on R2 as well`,hi:`Timers match hone chahiye: R2 par bhi ip hello-interval eigrp 100 20 set karo`},{en:`R1 still advertises a 15-second hold time but sends Hellos every 20 seconds; set ip hold-time eigrp 100 60 on R1 or restore the 5-second hello`,hi:`R1 ab bhi 15 second ka hold time advertise karta hai lekin Hellos har 20 second bhejta hai; R1 par ip hold-time eigrp 100 60 set karo ya 5 second ka hello wapas laao`},{en:`The K values changed when the hello changed`,hi:`Hello badalne par K values badal gayi`},{en:`There is an MTU mismatch on the link`,hi:`Link par MTU mismatch hai`}],a:1,w:{en:`Each router advertises its own hold time and the neighbour uses it. EIGRP does not raise the hold time automatically when the hello changes, so R2 waits 15 seconds for Hellos that come every 20 and declares R1 dead each cycle. Changing R2's hello would not help; R1's hold time is the problem.`,hi:`Har router apna hold time advertise karta hai aur neighbour wahi use karta hai. Hello badalne par EIGRP hold time apne aap nahi badhata, isliye R2 un Hellos ka 15 second wait karta hai jo har 20 second aate hain aur har cycle mein R1 ko dead declare karta hai. R2 ka hello badalne se kuch nahi hoga; problem R1 ka hold time hai.`}},{title:{en:`Hub resets a satellite branch`,hi:`Hub ek satellite branch ko reset karta hai`},ticket:{en:`A DMVPN hub with 200 EIGRP spokes logs stuck-in-active events whenever any branch LAN flaps. One spoke on a slow satellite link is reset each time. None of the spokes is a transit path.`,hi:`200 EIGRP spokes wala ek DMVPN hub jab bhi kisi branch LAN flap hota hai, stuck-in-active events log karta hai. Slow satellite link wala ek spoke har baar reset hota hai. Koi bhi spoke transit path nahi hai.`},out:`HUB#
%DUAL-3-SIA: Route 192.168.50.0/24 stuck-in-active state in IP-EIGRP(0) 100.  Cleaning up
%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.20.0.9 (Tunnel0) is down: stuck in active

HUB#show ip eigrp topology active
EIGRP-IPv4 Topology Table for AS(100)/ID(10.20.0.1)
A 192.168.50.0/24, 1 successors, FD is Inaccessible, Q
    1 replies, active 00:01:32, query-origin: Local origin
         via 10.20.0.5 (Infinity/Infinity), Tunnel0
      Remaining replies:
         via 10.20.0.9, r, Tunnel0`,q:{en:`What is the best long-term fix?`,hi:`Sabse achha long-term fix kya hai?`},o:[{en:`Increase the active timer to 10 minutes`,hi:`Active timer 10 minute kar do`},{en:`Schedule clear ip eigrp neighbors on the hub every hour`,hi:`Hub par har ghante clear ip eigrp neighbors schedule karo`},{en:`Configure eigrp stub on every spoke so the hub stops querying them, and summarise where possible`,hi:`Har spoke par eigrp stub configure karo taaki hub unhe query karna band kare, aur jahan ho sake summarise karo`},{en:`Configure variance on the hub`,hi:`Hub par variance configure karo`}],a:2,w:{en:`The hub is waiting for a Reply from 10.20.0.9 (marked r). Spokes are never transit paths, so stub routing removes them from the query domain: the hub no longer queries them and SIA stops. A longer active timer only delays the symptom; clearing neighbours causes more churn; variance is unrelated.`,hi:`Hub 10.20.0.9 (r se marked) ke Reply ka wait kar raha hai. Spokes kabhi transit paths nahi hote, isliye stub routing unhe query domain se hata deti hai: hub unhe query nahi karta aur SIA ruk jaata hai. Lamba active timer sirf symptom ko der se laata hai; neighbours clear karna aur churn laata hai; variance ka isse koi lena-dena nahi.`}}];export{e as default};