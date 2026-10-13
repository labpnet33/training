var e={id:`ebgp-ibgp-loopback-fullmesh`,h:{en:`EBGP, IBGP, loopback peering and the full mesh`,hi:`EBGP, IBGP, loopback peering aur full mesh`},body:{en:`
<p>Imagine a company with three offices. Each office has a gate to the outside world, and the guards at the gates must tell the guards inside what they learned. The talks across the gate are <b>EBGP</b>. The talks among the company's own guards are <b>IBGP</b>. The two behave a little differently, and that difference explains most of the BGP rules you will meet.</p>

<h3>EBGP and IBGP side by side</h3>
<table class="cmp"><tr><th></th><th>EBGP</th><th>IBGP</th></tr>
<tr><td>Peers</td><td>Different AS</td><td>Same AS</td></tr>
<tr><td>Usual peering address</td><td>The directly connected interface</td><td>Loopback, with local-address</td></tr>
<tr><td>AS path on advertisement</td><td>Own AS added</td><td>Not changed</td></tr>
<tr><td>Next hop on advertisement</td><td>Changed to self</td><td>Left unchanged</td></tr>
<tr><td>Local preference sent</td><td>No</td><td>Yes</td></tr>
<tr><td>Routes learned are passed on to</td><td>All peers</td><td>EBGP peers only, never to another IBGP peer</td></tr></table>

<h3>Why peer between loopbacks</h3>
<p>A physical interface fails when its link fails. A loopback never goes down while the router is alive. If two routers have two or more paths between them, an IBGP session between loopbacks survives any single link failure, because the IGP simply finds another path to the loopback. So the IGP carries the loopbacks and links, and BGP carries the customer and Internet prefixes. In Junos you must tell the session to use the loopback as source with <code>local-address</code>.</p>
<pre class="code">set protocols bgp group IBGP type internal
set protocols bgp group IBGP local-address 10.20.255.1
set protocols bgp group IBGP neighbor 10.20.255.2</pre>
<p>On R2 the same group has the mirrored addresses. Both routers use the same AS (65010), and type internal means peer-as is implied as the local AS. Here is what R1 shows when its ISP session and its IBGP session are both up:</p>
<pre class="out">lab@NGP-R1&gt; show bgp summary
Groups: 2 Peers: 2 Down peers: 0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.20.255.2           65010          2          3       0       0        0:25 Establ
  inet.0: 0/0/0/0
100.65.1.1            64500          4          3       0       0        0:55 Establ
  inet.0: 2/2/2/0</pre>
<p>The IBGP peer has the same AS as ours, so its AS column reads 65010. At this point R2 has not sent any route yet, which is why the first line ends in 0/0/0/0.</p>

<h3>The full mesh and split horizon</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="IBGP split horizon">
<circle cx="120" cy="105" r="30" fill="#bae6fd" stroke="#64748b"/><text x="120" y="109" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="320" cy="50" r="30" fill="#fed7aa" stroke="#64748b"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<circle cx="520" cy="105" r="30" fill="#ddd6fe" stroke="#64748b"/><text x="520" y="109" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<line x1="145" y1="90" x2="296" y2="62" stroke="#64748b" stroke-width="2"/><line x1="344" y1="62" x2="496" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="105" x2="490" y2="105" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Needed: R1-R3 session as well</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Without it R2 will not pass R1 routes to R3</text>
</svg><p class="cap">IBGP routes are not re-advertised between IBGP peers, so every pair needs a session.</p></div>
<p>The AS path does not grow inside an AS, so BGP cannot see loops there. To avoid them, it uses the <b>IBGP split-horizon rule</b>: a route learned from one IBGP peer is not sent to another IBGP peer. The result is that every IBGP router must peer with every other IBGP router, a <b>full mesh</b> of n times (n minus 1) divided by 2 sessions: 3 routers need 3, 5 routers need 10, 10 routers need 45. Route reflectors and confederations remove that burden; they are outside this module.</p>

<h3>Showing what is received and sent</h3>
<p>In the first lab, R2 exports its warehouse LAN with a policy, and the route travels R2 to R1 over IBGP and from R1 to the ISP over EBGP:</p>
<pre class="out">lab@NGP-R2&gt; show route advertising-protocol bgp 10.20.255.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.20.2.0/24            Self                         100        I
lab@NGP-R1&gt; show route advertising-protocol bgp 100.65.1.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.20.2.0/24            Self                                    [65010] I
lab@ISP-64500&gt; show route protocol bgp
10.20.2.0/24       *[BGP/170] 00:00:30, localpref 100
                      AS path: 65010 I</pre>
<p>Look at the differences. Towards IBGP the route has a local preference (100) and an empty AS path (I only). Towards EBGP the local preference is gone, and the AS path is <b>[65010]</b>: R1 prepends its own AS on the way out. The square brackets show the AS that Junos adds at export. The ISP therefore sees AS path 65010. The next hop towards the ISP is Self, as always for EBGP.</p>

<div class="eg"><p><b>Worked example.</b> How many IBGP sessions does an AS with 6 routers need in a full mesh? 6 times 5 divided by 2 is 15. Each router configures 5 neighbours. Adding a seventh router means one new neighbour line on each of the six existing ones: 6 more sessions, 21 in total. This is the reason that large ASes use route reflection.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring the IBGP neighbour as the loopback of the other router, but forgetting <code>local-address</code>. The session is then sourced from the outgoing interface address, which the neighbour does not expect, and it never comes up. Another mistake is no IGP route to the loopback.</p></div>
<div class="exam"><p><b>Exam trap.</b> IBGP does not change the next hop by default and does not add the AS. IBGP-learned routes are not advertised to other IBGP peers, but they are advertised to EBGP peers. Junos gives both IBGP and EBGP routes preference 170.</p></div>

<div class="scn"><h4>The third router that saw nothing</h4><p>A company added a third router. R1 and R2 had IBGP. R3 peered only with R2. R3 had BGP Established but no Internet routes. R2 was not allowed to pass R1's routes to R3 because of split horizon. The fix was a session between R1 and R3 on their loopbacks.</p><p><b>Lesson:</b> counting the sessions is part of reading the design.</p></div>

<div class="iv"><p class="q">"Why do IBGP routers need a full mesh?"</p><p>Because a route learned from an IBGP peer is not advertised to another IBGP peer. That rule prevents loops, since the AS path does not change inside the AS. As a result each router must hear from every border router directly. Route reflectors or confederations reduce the number of sessions in large networks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EBGP crosses ASes, changes the next hop and prepends the AS; IBGP keeps both.</li>
<li>Build IBGP between loopbacks with local-address and rely on the IGP to reach them.</li>
<li>IBGP split horizon forces a full mesh of n(n-1)/2 sessions.</li>
<li>show route advertising-protocol and receive-protocol prove what each side sends.</li>
</ul></div>
`,hi:`
<p>Teen offices wali company socho. Har office ka bahar ki duniya ke liye ek gate hai, aur gate ke guards ko andar ke guards ko batana padta hai ki unhone kya seekha. Gate ke paar ki baat <b>EBGP</b> hai. Company ke apne guards ke beech ki baat <b>IBGP</b> hai. Dono thoda alag behave karte hain, aur ye farq BGP ke zyada tar rules samjha deta hai.</p>

<h3>EBGP aur IBGP saath saath</h3>
<table class="cmp"><tr><th></th><th>EBGP</th><th>IBGP</th></tr>
<tr><td>Peers</td><td>Alag AS</td><td>Same AS</td></tr>
<tr><td>Aam peering address</td><td>Seedha jura interface</td><td>Loopback, local-address ke saath</td></tr>
<tr><td>Advertisement par AS path</td><td>Apna AS jodta hai</td><td>Nahi badalta</td></tr>
<tr><td>Advertisement par next hop</td><td>Self ho jaata hai</td><td>Wahi rehta hai</td></tr>
<tr><td>Local preference bheja jaata hai</td><td>Nahi</td><td>Haan</td></tr>
<tr><td>Seekhe hue routes kise jaate hain</td><td>Sab peers ko</td><td>Sirf EBGP peers ko, kabhi doosre IBGP peer ko nahi</td></tr></table>

<h3>Loopbacks ke beech peering kyun</h3>
<p>Physical interface tabhi fail hota hai jab link fail ho. Loopback router ke zinda rehte kabhi down nahi hota. Do routers ke beech do ya zyada raaste hon to loopbacks ke beech IBGP session kisi bhi ek link failure se bach jaata hai, kyunki IGP loopback tak doosra path dhoondh leta hai. Isliye IGP loopbacks aur links carry karta hai, aur BGP customer aur Internet prefixes. Junos mein session ko loopback source ke roop mein use karne ke liye <code>local-address</code> batana padta hai.</p>
<pre class="code">set protocols bgp group IBGP type internal
set protocols bgp group IBGP local-address 10.20.255.1
set protocols bgp group IBGP neighbor 10.20.255.2</pre>
<p>R2 par wahi group mirror addresses ke saath hota hai. Dono routers same AS (65010) use karte hain, aur type internal ka matlab peer-as local AS maana jaata hai. R1 par ISP aur IBGP dono sessions up hon to ye dikhta hai:</p>
<pre class="out">lab@NGP-R1&gt; show bgp summary
Groups: 2 Peers: 2 Down peers: 0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.20.255.2           65010          2          3       0       0        0:25 Establ
  inet.0: 0/0/0/0
100.65.1.1            64500          4          3       0       0        0:55 Establ
  inet.0: 2/2/2/0</pre>
<p>IBGP peer ka AS hamare AS jaisa hai, isliye AS column 65010 padhta hai. Is point par R2 ne koi route nahi bheja, isliye pehli line 0/0/0/0 par khatam hoti hai.</p>

<h3>Full mesh aur split horizon</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="IBGP split horizon">
<circle cx="120" cy="105" r="30" fill="#bae6fd" stroke="#64748b"/><text x="120" y="109" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="320" cy="50" r="30" fill="#fed7aa" stroke="#64748b"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<circle cx="520" cy="105" r="30" fill="#ddd6fe" stroke="#64748b"/><text x="520" y="109" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<line x1="145" y1="90" x2="296" y2="62" stroke="#64748b" stroke-width="2"/><line x1="344" y1="62" x2="496" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="105" x2="490" y2="105" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Zaroori: R1-R3 session bhi</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Uske bina R2 R1 ke routes R3 ko nahi dega</text>
</svg><p class="cap">IBGP routes IBGP peers ke beech re-advertise nahi hote, isliye har jodi ko session chahiye.</p></div>
<p>AS ke andar AS path badhta nahi, isliye BGP wahan loop nahi dekh sakta. Bachne ke liye wo <b>IBGP split-horizon rule</b> use karta hai: ek IBGP peer se seekha route doosre IBGP peer ko nahi bheja jaata. Natija: har IBGP router ko har doosre IBGP router se peer karna padta hai, yani n guna (n minus 1) bhaag 2 sessions ka <b>full mesh</b>: 3 routers ko 3, 5 routers ko 10, 10 routers ko 45. Route reflectors aur confederations ye bojh hatate hain; wo is module ke bahar hain.</p>

<h3>Kya mila aur kya bheja, dikhana</h3>
<p>Pehle lab mein R2 policy se apna warehouse LAN export karta hai, aur route R2 se R1 tak IBGP par aur R1 se ISP tak EBGP par jaata hai:</p>
<pre class="out">lab@NGP-R2&gt; show route advertising-protocol bgp 10.20.255.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.20.2.0/24            Self                         100        I
lab@NGP-R1&gt; show route advertising-protocol bgp 100.65.1.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.20.2.0/24            Self                                    [65010] I
lab@ISP-64500&gt; show route protocol bgp
10.20.2.0/24       *[BGP/170] 00:00:30, localpref 100
                      AS path: 65010 I</pre>
<p>Farq dekho. IBGP ki taraf route par local preference (100) hai aur AS path khaali (sirf I). EBGP ki taraf local preference gayab hai, aur AS path <b>[65010]</b> hai: R1 jaate waqt apna AS jodta hai. Square brackets us AS ko dikhate hain jo Junos export par jodta hai. Isliye ISP ko AS path 65010 dikhta hai. ISP ki taraf next hop Self hai, jaisa EBGP mein hamesha hota hai.</p>

<div class="eg"><p><b>Worked example.</b> 6 routers wale AS ko full mesh mein kitne IBGP sessions chahiye? 6 guna 5 bhaag 2 = 15. Har router 5 neighbours configure karta hai. Saatvaan router jodne ka matlab chhe maujooda routers par ek naya neighbour line: 6 aur sessions, kul 21. Isi karan bade ASes route reflection use karte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> IBGP neighbour ko doosre router ka loopback configure karna, par <code>local-address</code> bhool jaana. Session phir outgoing interface address se source hota hai, jise neighbour expect nahi karta, aur wo kabhi up nahi hota. Ek aur galti loopback ka IGP route na hona hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> IBGP default mein next hop nahi badalta aur AS nahi jodta. IBGP se seekhe routes doosre IBGP peers ko advertise nahi hote, par EBGP peers ko hote hain. Junos IBGP aur EBGP dono routes ko preference 170 deta hai.</p></div>

<div class="scn"><h4>Teesra router jisne kuch nahi dekha</h4><p>Company ne teesra router jodha. R1 aur R2 mein IBGP tha. R3 sirf R2 se peer karta tha. R3 par BGP Established tha par Internet routes nahi. Split horizon ki wajah se R2 R1 ke routes R3 ko nahi de sakta tha. Fix R1 aur R3 ke loopbacks ke beech session tha.</p><p><b>Lesson:</b> sessions ginna design padhne ka hissa hai.</p></div>

<div class="iv"><p class="q">"IBGP routers ko full mesh kyun chahiye?"</p><p>Kyunki IBGP peer se seekha route doosre IBGP peer ko advertise nahi hota. Ye rule loops rokta hai, kyunki AS ke andar AS path nahi badalta. Natija ye ki har router ko har border router se seedha sunna padta hai. Bade networks mein route reflectors ya confederations sessions ki sankhya kam karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EBGP ASes paar karta hai, next hop badalta hai aur AS jodta hai; IBGP dono rakhta hai.</li>
<li>IBGP loopbacks ke beech local-address ke saath banao aur unhe pahunchne ke liye IGP par bharosa karo.</li>
<li>IBGP split horizon n(n-1)/2 sessions ka full mesh maangta hai.</li>
<li>show route advertising-protocol aur receive-protocol saabit karte hain ki har side kya bhejti hai.</li>
</ul></div>
`}};export{e as default};