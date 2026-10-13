var e=[{title:{en:`OSPF down after the filter`,hi:`Filter ke baad OSPF down`},ticket:{en:`Right after PROTECT-RE was committed on R2, both OSPF neighbours disappeared. Read the output.`,hi:`R2 par PROTECT-RE commit hote hi dono OSPF neighbours gayab ho gaye. Output padho.`},out:`lab@R2-AGG> show ospf neighbor
lab@R2-AGG> show firewall filter PROTECT-RE

Filter: PROTECT-RE
Counters:
Name                                                Bytes              Packets
re-icmp                                               420                    5
re-drop                                             13240                  310

lab@R2-AGG> show configuration firewall family inet filter PROTECT-RE | display set
set firewall family inet filter PROTECT-RE term mgmt from protocol tcp
set firewall family inet filter PROTECT-RE term mgmt from destination-port ssh
set firewall family inet filter PROTECT-RE term mgmt then accept
set firewall family inet filter PROTECT-RE term ping from protocol icmp
set firewall family inet filter PROTECT-RE term ping then count re-icmp
set firewall family inet filter PROTECT-RE term ping then accept
set firewall family inet filter PROTECT-RE term rest then count re-drop
set firewall family inet filter PROTECT-RE term rest then discard`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Add an OSPF accept term before the discard term`,hi:`Discard term se pehle OSPF accept term jodo`},{en:`Change the OSPF area`,hi:`OSPF area badlo`},{en:`Disable ge-0/0/0`,hi:`ge-0/0/0 disable karo`},{en:`Add a static default route`,hi:`Static default route jodo`}],a:0,w:{en:`OSPF hellos fall to the final discard term (re-drop is climbing). Add a routing term that accepts OSPF before the discard.`,hi:`OSPF hellos aakhri discard term mein jaate hain (re-drop badh raha hai). Discard se pehle OSPF accept karne wala routing term jodo.`}},{title:{en:`Which table holds the backup?`,hi:`Backup kis table mein hai?`},ticket:{en:`A floating static route exists for 172.16.30.0/24 while OSPF is healthy. How many routes and which next hop does the PFE use?`,hi:`172.16.30.0/24 ke liye floating static route hai jabki OSPF healthy hai. Kitne routes hain aur PFE kaunsa next hop use karta hai?`},out:`lab@R1> show route 172.16.30.0/24
172.16.30.0/24     *[OSPF/10] 00:12:41, metric 2
                    >  to 10.0.12.2 via ge-0/0/0.0
                    [Static/200] 00:03:10
                    >  to 10.0.13.2 via ge-0/0/1.0

lab@R1> show route forwarding-table destination 172.16.30.10
172.16.30.0/24     user     0 10.0.12.2          ucst   622     2 ge-0/0/0.0`,q:{en:`What is the correct interpretation?`,hi:`Sahi interpretation kaunsi hai?`},o:[{en:`FIB uses 10.0.13.2 because it was added last`,hi:`FIB 10.0.13.2 use karti hai kyunki woh baad mein jodi gayi`},{en:`The routing table has 2 routes; the FIB uses 10.0.12.2 only`,hi:`Routing table mein 2 routes hain; FIB sirf 10.0.12.2 use karti hai`},{en:`Both next hops are in the FIB, load-balanced`,hi:`Dono next hops FIB mein hain, load-balanced`},{en:`The static route is active because 200 is higher`,hi:`Static route active hai kyunki 200 zyada hai`}],a:1,w:{en:`Lower preference wins, so OSPF (10) is active. The inactive static route is only in the routing table, not in the FIB.`,hi:`Kam preference jeetti hai, isliye OSPF (10) active hai. Inactive static route sirf routing table mein hai, FIB mein nahi.`}},{title:{en:`Backup became primary`,hi:`Backup primary ban gaya`},ticket:{en:`After adding a 4G backup route, all traffic to 172.16.30.0/24 moved to the slow link.`,hi:`4G backup route jodne ke baad 172.16.30.0/24 ka saara traffic slow link par chala gaya.`},out:`lab@R1> show route 172.16.30.0/24
172.16.30.0/24     *[Static/5] 00:00:19
                    >  to 10.0.13.2 via ge-0/0/1.0
                    [OSPF/10] 00:41:02, metric 2
                    >  to 10.0.12.2 via ge-0/0/0.0`,q:{en:`Why did this happen?`,hi:`Aisa kyun hua?`},o:[{en:`OSPF has a higher metric`,hi:`OSPF ka metric zyada hai`},{en:`The static route has no preference set, so default 5 beats OSPF 10`,hi:`Static route ki preference set nahi, to default 5 OSPF 10 ko harati hai`},{en:`The /24 is a longer prefix than OSPF`,hi:`/24 OSPF se lamba prefix hai`},{en:`The PFE prefers newer routes`,hi:`PFE naye routes ko prefer karta hai`}],a:1,w:{en:`A static route defaults to preference 5. Set preference 200 so OSPF stays active and the static route is a floating backup.`,hi:`Static route ki default preference 5 hoti hai. preference 200 set karo taaki OSPF active rahe aur static route floating backup bane.`}},{title:{en:`Ping to router fails, transit works`,hi:`Router ko ping fail, transit chalta hai`},ticket:{en:`Users reach SRV through R2 but cannot ping R2's loopback 10.255.0.2.`,hi:`Users R2 ke through SRV tak pahunchte hain lekin R2 ka loopback 10.255.0.2 ping nahi kar pate.`},out:`lab@R2-AGG> show firewall filter PROTECT-RE

Filter: PROTECT-RE
Counters:
Name                                                Bytes              Packets
re-drop                                              2184                   26
re-icmp                                                 0                    0

lab@R2-AGG> show configuration firewall family inet filter PROTECT-RE | display set | match term
set firewall family inet filter PROTECT-RE term routing from protocol ospf
set firewall family inet filter PROTECT-RE term rest then count re-drop
set firewall family inet filter PROTECT-RE term rest then discard
set firewall family inet filter PROTECT-RE term ping from protocol icmp`,q:{en:`What is the problem?`,hi:`Problem kya hai?`},o:[{en:`Transit traffic is blocked by the PFE`,hi:`PFE transit traffic block kar raha hai`},{en:`The ping term comes after the discard term, so it is never reached`,hi:`Ping term discard term ke baad hai, isliye kabhi reach nahi hota`},{en:`lo0 is down`,hi:`lo0 down hai`},{en:`ICMP cannot be filtered on lo0`,hi:`lo0 par ICMP filter nahi ho sakta`}],a:1,w:{en:`Terms are evaluated top to bottom. The catch-all discard term precedes the ping term, so ICMP is dropped (re-drop grows, re-icmp stays 0). Reorder with insert.`,hi:`Terms upar se neeche evaluate hote hain. Catch-all discard term ping term se pehle hai, isliye ICMP drop hota hai (re-drop badhta hai, re-icmp 0 rehta hai). insert se order theek karo.`}},{title:{en:`Classify the traffic`,hi:`Traffic classify karo`},ticket:{en:`After a test, R2 shows these PFE counters. PC1 pinged SRV (through R2) five times and nothing else ran.`,hi:`Ek test ke baad R2 ye PFE counters dikhata hai. PC1 ne SRV (R2 ke through) ko paanch baar ping kiya aur kuch aur nahi chala.`},out:`lab@R2-AGG> show pfe statistics traffic
Packet Forwarding Engine transit traffic (forwarded in hardware):
  Transit packets forwarded                 :                   10
Packet Forwarding Engine local traffic statistics (exception traffic):
  Local packets input                       :                   24
  Local packets output                      :                   24
    of which TTL expired (sent to RE)       :                    0`,q:{en:`What do the 10 transit packets represent?`,hi:`10 transit packets kya darshate hain?`},o:[{en:`Five requests plus five replies crossing R2`,hi:`R2 ko paar karte paanch requests aur paanch replies`},{en:`OSPF hellos`,hi:`OSPF hellos`},{en:`Five pings to the loopback`,hi:`Loopback ko paanch pings`},{en:`TTL-expired probes`,hi:`TTL-expired probes`}],a:0,w:{en:`Each ping is one request and one reply, both forwarded in hardware: 10 transit packets. The local counters belong to OSPF and other RE-bound traffic.`,hi:`Har ping ek request aur ek reply hai, dono hardware mein forward: 10 transit packets. Local counters OSPF aur RE-bound traffic ke hain.`}},{title:{en:`Stars in traceroute`,hi:`Traceroute mein stars`},ticket:{en:`A traceroute through the core shows stars for hop 3, yet ping to the final host is 0 percent loss.`,hi:`Core ke through traceroute hop 3 par stars dikhata hai, phir bhi final host ko ping 0 percent loss hai.`},out:`PC1> trace 10.30.3.10
1   10.10.1.1     0.9 ms
2   10.12.0.2     1.4 ms
3   *  *  *
4   10.30.3.10    2.3 ms

PC1> ping 10.30.3.10
5 packets transmitted, 5 packets received, 0% packet loss`,q:{en:`What is the most likely explanation?`,hi:`Sabse sambhavit vyakhya kya hai?`},o:[{en:`Hop 3 is dropping transit traffic`,hi:`Hop 3 transit traffic drop kar raha hai`},{en:`The route is wrong`,hi:`Route galat hai`},{en:`Hop 3 does not send ICMP time-exceeded (RE filtering or rate-limiting) but forwards transit traffic`,hi:`Hop 3 ICMP time-exceeded nahi bhejta (RE filtering ya rate-limit) lekin transit traffic forward karta hai`},{en:`The server is down`,hi:`Server down hai`}],a:2,w:{en:`Packets reach the destination, so hop 3 forwards transit traffic. It simply does not answer expired-TTL probes, which are exception traffic handled by the RE.`,hi:`Packets destination tak pahunchte hain, to hop 3 transit traffic forward karta hai. Woh bas expired-TTL probes ka jawab nahi deta, jo RE dwara handle hone wala exception traffic hai.`}},{title:{en:`Slow SSH, healthy forwarding`,hi:`SSH dheema, forwarding healthy`},ticket:{en:`SSH to a branch router takes 20 seconds per command. Users report no problems with applications.`,hi:`Branch router par SSH har command par 20 second leta hai. Users ko applications mein koi problem nahi.`},out:`Reference output (format illustrative; not produced by the simulator)
lab@BR1> show chassis routing-engine
Routing Engine status:
    Temperature                 38 degrees C / 100 degrees F
    CPU temperature             41 degrees C / 105 degrees F
    Total memory              2048 MB Max  1454 MB used ( 71 percent)
    CPU utilization:
      User                      88 percent
      Background                 0 percent
      Kernel                     8 percent
      Interrupt                  0 percent
      Idle                       4 percent
    Model                          RE-VIRTUAL

lab@BR1> show pfe statistics traffic
Packet Forwarding Engine transit traffic (forwarded in hardware):
    Transit packets forwarded             :              884201
Packet Forwarding Engine local traffic statistics (exception traffic):
...
    Software input control plane drops    :                   0`,q:{en:`Which plane is affected?`,hi:`Kaunsa plane affected hai?`},o:[{en:`Both planes equally`,hi:`Dono planes barabar`},{en:`The link layer`,hi:`Link layer`},{en:`The forwarding table`,hi:`Forwarding table`},{en:`The control plane (RE) only; forwarding is healthy`,hi:`Sirf control plane (RE); forwarding healthy hai`}],a:3,w:{en:`RE CPU is high while the PFE forwards normally. Find the busy process with show system processes extensive and fix the cause.`,hi:`RE CPU high hai jabki PFE normal forward kar raha hai. show system processes extensive se busy process dhoondho aur karan theek karo.`}}];export{e as default};