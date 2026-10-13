var e={id:`neighbours-and-dr`,h:{en:`PIM neighbours, hellos and the designated router`,hi:`PIM neighbours, hellos aur designated router`},body:{en:`
<p>Before any tree can be built, each router has to know which of its neighbours also speak PIM. Think of a street where every house puts a name board outside: you only post a letter to a house that has a board. PIM neighbours work the same way. This chapter covers how routers find each other, how long they remember each other, and how one router on a shared LAN is chosen to act for everybody else.</p>

<h3>Hello messages and the neighbour table</h3>
<p>Every interface with <code>ip pim sparse-mode</code> sends a <b>PIM Hello</b> to the all-PIM-routers address <b>224.0.0.13</b>, with TTL 1, inside IP protocol number 103. The default <b>hello interval is 30 seconds</b>. A Hello carries a <b>holdtime</b>, normally 3.5 times the interval, <b>105 seconds</b>. If no Hello arrives for the whole holdtime, the neighbour is declared dead and every tree that depended on it is recalculated. A Hello also carries the sender's <b>DR priority</b> and a <b>generation ID</b>, a random number that changes when PIM restarts, which tells neighbours to resend their state.</p>
<p>Two routers form an adjacency when both sides have PIM on the shared link and both hear a Hello. There is no password, no negotiation and no "state machine" to wait for. That makes PIM adjacency problems easy to find: if PIM is missing on one end, the other end sees nothing.</p>
<pre class="out">R2#show ip pim neighbor
PIM Neighbor Table
Mode: B - Bidir Capable, DR - Designated Router, N - Default DR Priority,
      P - Proxy Capable, S - State Refresh Capable, G - GenID Capable,
      L - DR Load-balancing Capable
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
10.0.12.1         GigabitEthernet0/1       00:02:20/00:01:25 v2    1 / S P G
<span class="hl">10.0.23.3         GigabitEthernet0/2       00:02:08/00:01:37 v2    1 / DR S P G</span>
10.0.24.4         GigabitEthernet0/3       00:01:56/00:00:49 v2    1 / DR S P G</pre>
<p>Read it like this: the neighbour address is the neighbour's address on that link, <b>Uptime/Expires</b> shows how long it has been known and how long until it expires if Hellos stop, <b>Ver v2</b> is PIM version 2, and the last column shows the neighbour's DR priority followed by flags. The word <b>DR</b> means that neighbour is the designated router on that segment.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="DR election on a LAN">
<rect x="40" y="20" width="150" height="60" rx="8" fill="#bae6fd"/><text x="115" y="45" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="115" y="64" text-anchor="middle" class="svg-muted" font-size="12">10.40.3.3 prio 200</text>
<rect x="450" y="20" width="150" height="60" rx="8" fill="#bae6fd"/><text x="525" y="45" text-anchor="middle" class="svg-ink" font-size="14">R4</text><text x="525" y="64" text-anchor="middle" class="svg-muted" font-size="12">10.40.3.4 prio 1</text>
<rect x="215" y="120" width="210" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">SW: shared LAN 10.40.3.0/24</text>
<line x1="115" y1="80" x2="260" y2="120" stroke="#64748b"/><line x1="525" y1="80" x2="380" y2="120" stroke="#64748b"/>
<rect x="260" y="170" width="120" height="30" rx="8" fill="#bbf7d0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">PC3 receiver</text>
<line x1="320" y1="156" x2="320" y2="170" stroke="#64748b"/>
<text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="13">R3 wins: priority first</text>
</svg><p class="cap">Highest DR priority wins; if priorities are equal, the highest IP address wins.</p></div>

<h3>Designated router: one router speaks for the LAN</h3>
<p>On a shared LAN (a switch with several routers and hosts) every router hears every Hello. They elect one <b>designated router (DR)</b>: <b>the highest DR priority wins; if priorities tie, the highest IP address wins.</b> The default priority is 1, so by default the router with the highest address is the DR. On a point-to-point link there is no real election and both ends show as DR; it does not matter.</p>
<p>The DR has two jobs, one for each side of the LAN:</p>
<ul>
<li><b>Receiver side.</b> When hosts report a group with IGMP, the DR sends the PIM Join toward the RP or the source. Other routers on that LAN do not send joins for it. This prevents duplicate copies of the stream.</li>
<li><b>Source side.</b> When a source on the LAN starts sending, the DR is the router that registers the source to the RP (chapter 4).</li>
</ul>
<div class="warn"><p><b>Common mistake: IGMP querier and PIM DR are different jobs.</b> The IGMP querier (the router that asks "who wants groups?") is the router with the <b>lowest</b> IP address. The PIM DR is the router with the <b>highest</b> priority, then the <b>highest</b> address. They can be two different routers on the same LAN, and that is normal.</p></div>

<h3>Choosing the DR on purpose</h3>
<p>Why would you care? Because the DR decides where the stream enters the LAN. In the lab for this chapter, R3 and R4 share the depot LAN. R4 has the higher address, so it wins by default, and it pulls the stream through the RP. R3 has a direct link to the source router and would be the better entry point. Raise its priority:</p>
<pre class="code"><span class="c">! R3 - make R3 the DR on the depot LAN</span>
interface GigabitEthernet0/0
 ip pim dr-priority 200</pre>
<pre class="out">R3#show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
<span class="hl">10.40.3.3        GigabitEthernet0/0       v2/S   1      30     200        10.40.3.3</span>
10.0.13.3        GigabitEthernet0/1       v2/S   1      30     1          10.0.13.3
10.0.23.3        GigabitEthernet0/2       v2/S   1      30     1          10.0.23.3

R4#show ip pim neighbor
...
10.40.3.3         GigabitEthernet0/0       00:00:29/00:01:16 v2    200 / DR S P G</pre>
<p><code>show ip pim interface</code> lists each PIM interface: <b>Ver/Mode</b> is the PIM version and mode (S for sparse, D for dense), <b>Nbr Count</b> the neighbours, <b>Query Intvl</b> the Hello interval (30 s), <b>DR Prior</b> the priority of this router and <b>DR</b> the address of the elected DR. Before the change, the same command on R3 showed the DR as 10.40.3.4, because R4's address is higher.</p>
<div class="eg"><p><b>Worked example.</b> LAN 10.40.3.0/24 has R3 (10.40.3.3) and R4 (10.40.3.4). Both priority 1: tie, higher address wins, R4 is DR. Set R3 to 200: R3 wins on priority even though its address is lower. Set R4 to 300 later: R4 wins again. Priority always beats address. A DR change moves the PIM joins for that LAN, so streams can hiccup for a moment; change it in a maintenance window.</p></div>
<div class="exam"><p><b>Exam trap.</b> The DR election is preemptive: a router that joins the LAN with a higher priority (or the same priority and a higher address) becomes DR as soon as the others hear its Hello. Also, if even one router on the LAN sends Hellos without the DR priority option, every router falls back to comparing IP addresses only.</p></div>

<div class="scn"><h4>The stream took the long way round</h4><p>At the Nagpur depot, the bulletin arrived but the WAN team saw 40 Mbps on the core link to the RP every morning while a cheap direct link to head office stayed empty. Both depot routers shared a LAN. The router with the higher address, which had no direct link, was the DR and pulled the stream through the RP. The team set <code>ip pim dr-priority 200</code> on the router with the direct link. The load moved to the direct path after the next join.</p><p><b>Lesson:</b> the DR is not decoration. It decides which router joins the tree for a LAN, so it decides the path.</p></div>

<div class="iv"><p class="q">"How is a PIM DR elected, and how is it different from the IGMP querier?"</p><p>Strong answer: highest DR priority wins, then highest IP address; default priority 1. The DR sends joins for the receivers on the LAN and registers local sources to the RP. The IGMP querier is a different election: the lowest IP address. Mention that you can steer the stream path with <code>ip pim dr-priority</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PIM Hellos go to 224.0.0.13 every 30 s with a 105 s holdtime; both ends need PIM to form a neighbour.</li>
<li><code>show ip pim neighbor</code> lists neighbours, uptime, expiry, DR priority and the DR flag.</li>
<li>DR: highest priority, then highest IP. IGMP querier: lowest IP. Two different jobs.</li>
<li>The DR joins the tree for LAN receivers and registers LAN sources.</li>
<li><code>ip pim dr-priority</code> on the interface lets you choose the entry path.</li>
</ul></div>
`,hi:`
<p>Koi bhi tree banne se pehle har router ko pata hona chahiye ki uske kaunse neighbours PIM bolte hain. Ek gali socho jahan har ghar ke bahar naam ki takhti lagi ho: aap chitthi sirf us ghar ko daalte ho jiske bahar takhti hai. PIM neighbours bhi aise hi kaam karte hain. Yeh chapter batata hai ki routers ek dusre ko kaise dhoondhte hain, kitni der tak yaad rakhte hain, aur shared LAN par ek router ko baaki sabki taraf se kaam karne ke liye kaise chuna jaata hai.</p>

<h3>Hello messages aur neighbour table</h3>
<p><code>ip pim sparse-mode</code> wala har interface all-PIM-routers address <b>224.0.0.13</b> par <b>PIM Hello</b> bhejta hai, TTL 1 ke saath, IP protocol number 103 ke andar. Default <b>hello interval 30 seconds</b> hai. Hello mein ek <b>holdtime</b> hota hai, aam taur par interval ka 3.5 guna, yaani <b>105 seconds</b>. Agar poore holdtime tak koi Hello na aaye to neighbour dead maana jaata hai aur uspar depend karne wale har tree ko dobara calculate kiya jaata hai. Hello mein bhejne wale ki <b>DR priority</b> aur ek <b>generation ID</b> bhi hoti hai; generation ID ek random number hai jo PIM restart hone par badalta hai aur neighbours ko apni state dobara bhejne ka signal deta hai.</p>
<p>Do routers tab adjacency banate hain jab shared link par dono taraf PIM ho aur dono Hello sunein. Na password hai, na negotiation, na kisi "state machine" ka intezaar. Isliye PIM adjacency ki problems dhoondhna aasan hai: agar ek end par PIM missing hai to doosra end kuch nahi dekhta.</p>
<pre class="out">R2#show ip pim neighbor
PIM Neighbor Table
Mode: B - Bidir Capable, DR - Designated Router, N - Default DR Priority,
      P - Proxy Capable, S - State Refresh Capable, G - GenID Capable,
      L - DR Load-balancing Capable
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
10.0.12.1         GigabitEthernet0/1       00:02:20/00:01:25 v2    1 / S P G
<span class="hl">10.0.23.3         GigabitEthernet0/2       00:02:08/00:01:37 v2    1 / DR S P G</span>
10.0.24.4         GigabitEthernet0/3       00:01:56/00:00:49 v2    1 / DR S P G</pre>
<p>Aise padho: neighbour address us link par neighbour ka address hai, <b>Uptime/Expires</b> batata hai ki woh kab se known hai aur Hellos band hone par kab expire hoga, <b>Ver v2</b> PIM version 2 hai, aur aakhri column neighbour ki DR priority aur uske baad flags dikhata hai. <b>DR</b> shabd ka matlab hai ki woh neighbour us segment par designated router hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="LAN par DR election">
<rect x="40" y="20" width="150" height="60" rx="8" fill="#bae6fd"/><text x="115" y="45" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="115" y="64" text-anchor="middle" class="svg-muted" font-size="12">10.40.3.3 prio 200</text>
<rect x="450" y="20" width="150" height="60" rx="8" fill="#bae6fd"/><text x="525" y="45" text-anchor="middle" class="svg-ink" font-size="14">R4</text><text x="525" y="64" text-anchor="middle" class="svg-muted" font-size="12">10.40.3.4 prio 1</text>
<rect x="215" y="120" width="210" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">SW: shared LAN 10.40.3.0/24</text>
<line x1="115" y1="80" x2="260" y2="120" stroke="#64748b"/><line x1="525" y1="80" x2="380" y2="120" stroke="#64748b"/>
<rect x="260" y="170" width="120" height="30" rx="8" fill="#bbf7d0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">PC3 receiver</text>
<line x1="320" y1="156" x2="320" y2="170" stroke="#64748b"/>
<text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="13">R3 jeetta hai: pehle priority</text>
</svg><p class="cap">Sabse badi DR priority jeetti hai; priorities barabar hon to sabse bada IP address jeetta hai.</p></div>

<h3>Designated router: ek router poori LAN ki taraf se bolta hai</h3>
<p>Shared LAN par (ek switch jis par kai routers aur hosts hain) har router har Hello sunta hai. Woh ek <b>designated router (DR)</b> chunte hain: <b>sabse badi DR priority jeetti hai; priorities barabar hon to sabse bada IP address jeetta hai.</b> Default priority 1 hai, isliye default mein sabse bade address wala router DR hota hai. Point-to-point link par asli election nahi hota aur dono ends DR dikhte hain; usse koi farak nahi padta.</p>
<p>DR ke do kaam hain, LAN ki har taraf ke liye ek:</p>
<ul>
<li><b>Receiver side.</b> Jab hosts IGMP se group report karte hain, DR PIM Join RP ya source ki taraf bhejta hai. Us LAN ke baaki routers uske liye join nahi bhejte. Isse stream ki duplicate copies nahi bantin.</li>
<li><b>Source side.</b> Jab LAN par koi source bhejna shuru karta hai, DR hi woh router hai jo source ko RP ke paas register karta hai (chapter 4).</li>
</ul>
<div class="warn"><p><b>Common galti: IGMP querier aur PIM DR alag kaam hain.</b> IGMP querier (jo router poochta hai "kisko groups chahiye?") <b>sabse chhote</b> IP address wala router hota hai. PIM DR <b>sabse badi</b> priority, phir <b>sabse bade</b> address wala router hota hai. Ek hi LAN par yeh do alag routers ho sakte hain, aur yeh normal hai.</p></div>

<h3>DR ko soch samajh kar chuno</h3>
<p>Aapko isse kya farak? Kyunki DR tay karta hai ki stream LAN mein kahan se aayegi. Is chapter ke lab mein R3 aur R4 depot LAN share karte hain. R4 ka address bada hai, isliye woh default mein jeetta hai, aur stream ko RP ke through kheenchta hai. R3 ka source router se seedha link hai aur woh behtar entry point hota. Uski priority badhao:</p>
<pre class="code"><span class="c">! R3 - depot LAN par R3 ko DR banao</span>
interface GigabitEthernet0/0
 ip pim dr-priority 200</pre>
<pre class="out">R3#show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
<span class="hl">10.40.3.3        GigabitEthernet0/0       v2/S   1      30     200        10.40.3.3</span>
10.0.13.3        GigabitEthernet0/1       v2/S   1      30     1          10.0.13.3
10.0.23.3        GigabitEthernet0/2       v2/S   1      30     1          10.0.23.3

R4#show ip pim neighbor
...
10.40.3.3         GigabitEthernet0/0       00:00:29/00:01:16 v2    200 / DR S P G</pre>
<p><code>show ip pim interface</code> har PIM interface list karta hai: <b>Ver/Mode</b> PIM version aur mode hai (S sparse, D dense), <b>Nbr Count</b> neighbours, <b>Query Intvl</b> Hello interval (30 s), <b>DR Prior</b> is router ki priority aur <b>DR</b> elected DR ka address. Change se pehle R3 par yahi command DR 10.40.3.4 dikhata tha, kyunki R4 ka address bada hai.</p>
<div class="eg"><p><b>Worked example.</b> LAN 10.40.3.0/24 par R3 (10.40.3.3) aur R4 (10.40.3.4) hain. Dono priority 1: tie, bada address jeetta hai, R4 DR hai. R3 ko 200 karo: R3 priority se jeet jaata hai chahe uska address chhota ho. Baad mein R4 ko 300 karo: R4 phir jeetta hai. Priority hamesha address ko haraati hai. DR badalne se us LAN ke PIM joins shift hote hain, isliye stream thodi der ke liye atak sakti hai; ise maintenance window mein badlo.</p></div>
<div class="exam"><p><b>Exam trap.</b> DR election preemptive hai: jo router LAN par ooncha priority (ya same priority aur bada address) leke aata hai woh jaise hi baaki uska Hello sunte hain DR ban jaata hai. Aur agar LAN par ek bhi router DR priority option ke bina Hello bheje, to saare routers sirf IP address compare karne par laut jaate hain.</p></div>

<div class="scn"><h4>Stream ghoom ke lambe raaste se aayi</h4><p>Nagpur depot par bulletin aa raha tha, par WAN team ko har subah RP tak core link par 40 Mbps dikhta tha jabki head office ka sasta direct link khaali padha rehta tha. Dono depot routers ek LAN share karte the. Bade address wala router, jiske paas direct link nahi tha, DR tha aur stream RP ke through kheenchta tha. Team ne direct link wale router par <code>ip pim dr-priority 200</code> lagaya. Agle join ke baad load direct path par chala gaya.</p><p><b>Seekh:</b> DR sajaavat nahi hai. Yeh tay karta hai ki LAN ke liye kaunsa router tree join karega, yaani path tay karta hai.</p></div>

<div class="iv"><p class="q">"PIM DR kaise elect hota hai, aur IGMP querier se kaise alag hai?"</p><p>Strong answer: sabse badi DR priority jeetti hai, phir sabse bada IP address; default priority 1. DR LAN ke receivers ke liye joins bhejta hai aur local sources ko RP ke paas register karta hai. IGMP querier alag election hai: sabse chhota IP address. Batao ki <code>ip pim dr-priority</code> se aap stream ka path steer kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PIM Hellos 224.0.0.13 par har 30 s jaate hain, holdtime 105 s; neighbour banne ke liye dono ends par PIM chahiye.</li>
<li><code>show ip pim neighbor</code> neighbours, uptime, expiry, DR priority aur DR flag dikhata hai.</li>
<li>DR: sabse badi priority, phir sabse bada IP. IGMP querier: sabse chhota IP. Do alag kaam.</li>
<li>DR LAN receivers ke liye tree join karta hai aur LAN sources ko register karta hai.</li>
<li>Interface par <code>ip pim dr-priority</code> se aap entry path chun sakte ho.</li>
</ul></div>
`}};export{e as default};