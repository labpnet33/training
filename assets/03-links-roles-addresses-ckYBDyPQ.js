var e={id:`links-roles`,h:{en:`Failover link, state link, roles and addresses`,hi:`Failover link, state link, roles aur addresses`},body:{en:`
<p>Back to the two pilots. They need two things to work as a team: an <b>intercom</b> to say "I am fine, are you fine?" and to agree who is flying, and a <b>shared logbook</b> so the co-pilot knows every detail of the flight. They also each have a <b>seat label</b> (captain's seat, first officer's seat) that never changes, even when the first officer takes the controls. An ASA pair has exactly these pieces: the failover link (intercom), the state link (logbook) and fixed unit labels separate from the changing state.</p>

<h3>The failover link</h3>
<p>The <b>failover link</b> (often called the LAN failover link) is a dedicated interface that connects the two units. Over it they exchange:</p>
<ul>
<li><b>Hello messages</b> (keepalives) that prove each unit is alive, every unit poll time.</li>
<li>The <b>state</b> of each unit (Active, Standby Ready, Failed) and the negotiation of who is active.</li>
<li><b>Configuration replication</b>: every command entered on the active unit, and the full configuration when the standby joins.</li>
<li>MAC address exchange, license information and commands such as <code>failover exec mate</code>.</li>
</ul>
<p>The failover interface is <b>not</b> a data interface: it has no <code>nameif</code> in the interface configuration, only <code>no shutdown</code>. It gets a logical name and addresses from the failover commands. In the lab it is <b>FOLINK</b> on GigabitEthernet0/5.</p>

<h3>The stateful failover link</h3>
<p>The <b>state link</b> carries the stateful information: the connection table, NAT translations, ARP entries, VPN security associations and more (chapter 6 has the full list). You have three choices:</p>
<ul>
<li><b>Share the failover link</b> (<code>failover link FOLINK GigabitEthernet0/5</code>): simplest, fine for low traffic.</li>
<li><b>Dedicated interface</b> (<code>failover link STATELINK GigabitEthernet0/4</code>): best practice for busy firewalls, because state updates can be heavy and must not delay hellos. The lab uses this.</li>
<li>A data interface: technically possible on older releases but not recommended; state traffic competes with user traffic.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Failover and state links">
<rect x="40" y="70" width="170" height="80" rx="10" fill="#bae6fd"/><text x="125" y="98" text-anchor="middle" class="svg-ink" font-size="14">ASA1</text><text x="125" y="118" text-anchor="middle" class="svg-muted" font-size="12">unit: Primary</text><text x="125" y="136" text-anchor="middle" class="svg-accent" font-size="12">state: Active</text>
<rect x="430" y="70" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="515" y="98" text-anchor="middle" class="svg-ink" font-size="14">ASA2</text><text x="515" y="118" text-anchor="middle" class="svg-muted" font-size="12">unit: Secondary</text><text x="515" y="136" text-anchor="middle" class="svg-accent" font-size="12">state: Standby Ready</text>
<line x1="210" y1="90" x2="430" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">FOLINK Gi0/5: hellos, states, config</text>
<text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">192.168.255.1 ↔ 192.168.255.2</text>
<line x1="210" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="4"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="12">STATELINK Gi0/4: conns, xlates, SAs</text>
<text x="320" y="153" text-anchor="middle" class="svg-muted" font-size="12">192.168.254.1 ↔ 192.168.254.2</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Failover link addresses stay with the unit; data addresses follow the Active state</text>
</svg><p class="cap">Two separate links: FOLINK for control and configuration, STATELINK for connection state.</p></div>

<h3>Unit role versus state: two different things</h3>
<p>This is the single most confused idea in ASA HA, so learn it now:</p>
<dl class="terms">
<dt>Unit role (Primary / Secondary)</dt><dd>A <b>fixed label</b> you configure with <code>failover lan unit primary</code> or <code>failover lan unit secondary</code>. It decides which failover link address a unit uses, which MAC addresses are the active ones by default, and which unit becomes active when both boot at the same time (the primary). It never changes by itself.</dd>
<dt>State (Active / Standby Ready / Failed ...)</dt><dd>The <b>current job</b> of the unit. It changes at every failover. After a failure the secondary can be Active for weeks, and the primary Standby Ready.</dd>
</dl>
<p>The <code>prompt hostname priority state</code> command shows both at a glance, for example <code>NK-ASA/pri/act#</code> or <code>NK-ASA/sec/stby#</code>.</p>

<h3>Active and standby addresses on data interfaces</h3>
<p>Every data interface gets two IP addresses in one command:</p>
<pre class="code">interface GigabitEthernet0/1
 nameif inside
 security-level 100
 ip address 10.0.1.1 255.255.255.0 standby 10.0.1.2</pre>
<p>The <b>active address</b> (10.0.1.1) always belongs to whichever unit is Active; PCs use it as their gateway. The <b>standby address</b> (10.0.1.2) is used by the Standby unit, so you can manage it and so the two units can test each other's interfaces. At failover the units <b>swap</b> addresses.</p>
<p>The MAC addresses swap too. By default the <b>active MAC</b> of each interface is the primary unit's burned-in MAC, and the standby MAC is the secondary's. After a failover the new active unit takes over the active IP <b>and</b> active MAC and sends <b>gratuitous ARPs</b> so switches update their MAC tables. Because the MAC did not change, hosts do not even need to update their ARP caches.</p>
<p>The failover link addresses behave differently: in <code>failover interface ip FOLINK 192.168.255.1 255.255.255.252 standby 192.168.255.2</code> the first address always belongs to the <b>primary</b> and the standby address to the <b>secondary</b>, whatever their state. The line is identical on both units.</p>

<div class="eg"><p><b>Worked example.</b> After the pair forms, ASA2 is standby. On ASA2 <code>show ip</code> shows two tables:</p>
<pre class="out">NK-ASA# show ip
System IP Addresses:
Interface                Name                   IP address      Subnet mask     Method
GigabitEthernet0/0       outside                203.0.113.2     255.255.255.248 CONFIG
GigabitEthernet0/1       inside                 10.0.1.1        255.255.255.0   CONFIG
Current IP Addresses:
Interface                Name                   IP address      Subnet mask     Method
GigabitEthernet0/0       outside                203.0.113.3     255.255.255.248 CONFIG
<span class="hl">GigabitEthernet0/1       inside                 10.0.1.2        255.255.255.0   CONFIG</span></pre>
<p>System addresses are what is configured (the active ones); current addresses are what this unit uses now. Lab 1 asks exactly this: ASA2 currently uses 10.0.1.2 on inside.</p></div>

<h3>Virtual MAC addresses</h3>
<p>There is one weakness in the default behaviour. If the <b>secondary boots alone</b> (the primary is broken), it becomes active with <b>its own</b> burned-in MACs. When the repaired primary later joins, the active MACs change to the primary's, and every neighbour must relearn them, which causes a short disruption. Replacing the primary hardware changes the MACs as well. Configuring <b>virtual MAC addresses</b> removes both problems:</p>
<pre class="code">interface GigabitEthernet0/1
 mac-address 0200.0a00.0101 standby 0200.0a00.0102
<span class="c">! or, in the failover configuration:</span>
failover mac address GigabitEthernet0/1 0200.0a00.0101 0200.0a00.0102</pre>

<div class="warn"><p><b>Common mistake.</b> Giving the failover interface a <code>nameif</code> or an <code>ip address</code> under the interface. The failover link is configured only with the <code>failover lan interface</code> and <code>failover interface ip</code> commands; the interface itself just needs <code>no shutdown</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Primary" does not mean "active". A question describing a secondary unit that is currently active is perfectly normal. Also, the failover link addresses do not swap at failover; the data interface addresses do.</p></div>

<div class="scn"><h4>The replaced primary that broke the ARP caches</h4><p>A primary ASA was replaced after a hardware fault. During the swap the secondary had run as active with the primary's MACs. The new primary joined and, because no virtual MACs were configured, the active MACs changed to the new chassis's burned-in MACs. The upstream ISP router had a long ARP timeout and a static ARP-like binding in its policy, so internet traffic stopped for several minutes until the ISP cleared its ARP entry. The engineer then configured virtual MACs on all data interfaces so that future replacements would be invisible.</p><p><b>Lesson:</b> virtual MACs make the pair's identity independent of the hardware.</p></div>

<div class="iv"><p class="q">"What is the difference between primary/secondary and active/standby on an ASA?"</p><p>Strong answer: primary and secondary are fixed configured roles, set with <code>failover lan unit</code>; they decide failover link addressing, default active MACs and who wins when both boot together. Active and standby are the current states and move at every failover. Add that data interfaces carry an active and a standby address that swap with the state, while failover link addresses stay with the unit, and that virtual MACs avoid MAC changes when the secondary boots alone or hardware is replaced.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Failover link: hellos, states, configuration replication; no nameif.</li>
<li>State link: connections, xlates, SAs; shared with the failover link or, better, dedicated.</li>
<li>Primary/secondary are fixed labels; Active/Standby Ready are states that move.</li>
<li>Data interfaces use <code>ip address A M standby B</code>; the active IP and MAC follow the Active state.</li>
<li>Virtual MACs protect against MAC changes when the secondary boots alone or a unit is replaced.</li>
</ul></div>
`,hi:`
<p>Wapas do pilots par aate hain. Team ki tarah kaam karne ke liye unhe do cheezein chahiye: ek <b>intercom</b> yeh kehne ke liye ki "main theek hoon, tum theek ho?" aur yeh tay karne ke liye ki kaun uda raha hai, aur ek <b>shared logbook</b> taaki co-pilot ko flight ki har detail pata ho. Dono ki ek <b>seat label</b> bhi hoti hai (captain ki seat, first officer ki seat) jo kabhi nahi badalti, tab bhi jab first officer controls le leta hai. ASA pair mein bilkul yahi pieces hain: failover link (intercom), state link (logbook) aur fixed unit labels jo badalti state se alag hain.</p>

<h3>Failover link</h3>
<p><b>Failover link</b> (jise aksar LAN failover link kehte hain) ek dedicated interface hai jo dono units ko jodta hai. Iske upar woh exchange karte hain:</p>
<ul>
<li><b>Hello messages</b> (keepalives) jo har unit poll time par saabit karte hain ki har unit zinda hai.</li>
<li>Har unit ki <b>state</b> (Active, Standby Ready, Failed) aur active kaun hoga iska negotiation.</li>
<li><b>Configuration replication</b>: active unit par daali gayi har command, aur standby judne par poori configuration.</li>
<li>MAC address exchange, license information aur <code>failover exec mate</code> jaisi commands.</li>
</ul>
<p>Failover interface data interface <b>nahi</b> hai: interface configuration mein iska koi <code>nameif</code> nahi hota, sirf <code>no shutdown</code>. Ise logical naam aur addresses failover commands se milte hain. Lab mein yeh GigabitEthernet0/5 par <b>FOLINK</b> hai.</p>

<h3>Stateful failover link</h3>
<p><b>State link</b> stateful information le jaata hai: connection table, NAT translations, ARP entries, VPN security associations aur bahut kuch (poori list chapter 6 mein). Aapke paas teen choices hain:</p>
<ul>
<li><b>Failover link share karo</b> (<code>failover link FOLINK GigabitEthernet0/5</code>): sabse simple, kam traffic ke liye theek.</li>
<li><b>Dedicated interface</b> (<code>failover link STATELINK GigabitEthernet0/4</code>): busy firewalls ke liye best practice, kyunki state updates bhaari ho sakte hain aur hellos ko delay nahi karne chahiye. Lab yahi use karti hai.</li>
<li>Ek data interface: purane releases par technically possible par recommended nahi; state traffic user traffic se competition karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Failover and state links">
<rect x="40" y="70" width="170" height="80" rx="10" fill="#bae6fd"/><text x="125" y="98" text-anchor="middle" class="svg-ink" font-size="14">ASA1</text><text x="125" y="118" text-anchor="middle" class="svg-muted" font-size="12">unit: Primary</text><text x="125" y="136" text-anchor="middle" class="svg-accent" font-size="12">state: Active</text>
<rect x="430" y="70" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="515" y="98" text-anchor="middle" class="svg-ink" font-size="14">ASA2</text><text x="515" y="118" text-anchor="middle" class="svg-muted" font-size="12">unit: Secondary</text><text x="515" y="136" text-anchor="middle" class="svg-accent" font-size="12">state: Standby Ready</text>
<line x1="210" y1="90" x2="430" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">FOLINK Gi0/5: hellos, states, config</text>
<text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">192.168.255.1 ↔ 192.168.255.2</text>
<line x1="210" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="4"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="12">STATELINK Gi0/4: conns, xlates, SAs</text>
<text x="320" y="153" text-anchor="middle" class="svg-muted" font-size="12">192.168.254.1 ↔ 192.168.254.2</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Failover link addresses unit ke saath rehte hain; data addresses Active state ke saath chalte hain</text>
</svg><p class="cap">Do alag links: control aur configuration ke liye FOLINK, connection state ke liye STATELINK.</p></div>

<h3>Unit role aur state: do alag cheezein</h3>
<p>ASA HA mein yeh sabse zyada confuse hone wala idea hai, isliye abhi seekh lo:</p>
<dl class="terms">
<dt>Unit role (Primary / Secondary)</dt><dd>Ek <b>fixed label</b> jo aap <code>failover lan unit primary</code> ya <code>failover lan unit secondary</code> se configure karte ho. Yeh tay karta hai ki unit kaunsa failover link address use karega, default mein kaunse MAC addresses active wale honge, aur dono ek saath boot hon to kaunsa unit active banega (primary). Yeh apne aap kabhi nahi badalta.</dd>
<dt>State (Active / Standby Ready / Failed ...)</dt><dd>Unit ka <b>current kaam</b>. Har failover par badalta hai. Failure ke baad secondary hafton tak Active reh sakta hai, aur primary Standby Ready.</dd>
</dl>
<p><code>prompt hostname priority state</code> command dono ek nazar mein dikhati hai, jaise <code>NK-ASA/pri/act#</code> ya <code>NK-ASA/sec/stby#</code>.</p>

<h3>Data interfaces par active aur standby addresses</h3>
<p>Har data interface ko ek command mein do IP addresses milte hain:</p>
<pre class="code">interface GigabitEthernet0/1
 nameif inside
 security-level 100
 ip address 10.0.1.1 255.255.255.0 standby 10.0.1.2</pre>
<p><b>Active address</b> (10.0.1.1) hamesha us unit ka hota hai jo Active hai; PCs ise gateway ki tarah use karte hain. <b>Standby address</b> (10.0.1.2) Standby unit use karta hai, taaki aap use manage kar sako aur dono units ek doosre ke interfaces test kar sakein. Failover par units addresses <b>swap</b> karte hain.</p>
<p>MAC addresses bhi swap hote hain. Default mein har interface ka <b>active MAC</b> primary unit ka burned-in MAC hota hai, aur standby MAC secondary ka. Failover ke baad naya active unit active IP <b>aur</b> active MAC le leta hai aur <b>gratuitous ARPs</b> bhejta hai taaki switches apni MAC tables update karein. Kyunki MAC nahi badla, hosts ko apni ARP caches update karne ki bhi zaroorat nahi.</p>
<p>Failover link addresses alag tarah behave karte hain: <code>failover interface ip FOLINK 192.168.255.1 255.255.255.252 standby 192.168.255.2</code> mein pehla address hamesha <b>primary</b> ka aur standby address <b>secondary</b> ka hota hai, state kuch bhi ho. Yeh line dono units par same hoti hai.</p>

<div class="eg"><p><b>Worked example.</b> Pair banne ke baad ASA2 standby hai. ASA2 par <code>show ip</code> do tables dikhata hai:</p>
<pre class="out">NK-ASA# show ip
System IP Addresses:
Interface                Name                   IP address      Subnet mask     Method
GigabitEthernet0/0       outside                203.0.113.2     255.255.255.248 CONFIG
GigabitEthernet0/1       inside                 10.0.1.1        255.255.255.0   CONFIG
Current IP Addresses:
Interface                Name                   IP address      Subnet mask     Method
GigabitEthernet0/0       outside                203.0.113.3     255.255.255.248 CONFIG
<span class="hl">GigabitEthernet0/1       inside                 10.0.1.2        255.255.255.0   CONFIG</span></pre>
<p>System addresses woh hain jo configure hain (active wale); current addresses woh hain jo yeh unit abhi use karta hai. Lab 1 bilkul yahi poochti hai: ASA2 abhi inside par 10.0.1.2 use karta hai.</p></div>

<h3>Virtual MAC addresses</h3>
<p>Default behaviour mein ek kamzori hai. Agar <b>secondary akela boot</b> ho (primary kharab hai), to woh <b>apne</b> burned-in MACs ke saath active ban jaata hai. Jab repair hua primary baad mein judta hai, active MACs primary ke ho jaate hain, aur har neighbour ko unhe dobara seekhna padta hai, jisse chhota disruption hota hai. Primary hardware replace karne se bhi MACs badal jaate hain. <b>Virtual MAC addresses</b> configure karne se dono problems hat jaati hain:</p>
<pre class="code">interface GigabitEthernet0/1
 mac-address 0200.0a00.0101 standby 0200.0a00.0102
<span class="c">! ya, failover configuration mein:</span>
failover mac address GigabitEthernet0/1 0200.0a00.0101 0200.0a00.0102</pre>

<div class="warn"><p><b>Common galti.</b> Failover interface ko interface ke neeche <code>nameif</code> ya <code>ip address</code> dena. Failover link sirf <code>failover lan interface</code> aur <code>failover interface ip</code> commands se configure hota hai; interface ko bas <code>no shutdown</code> chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Primary" ka matlab "active" nahi hai. Aisa question jismein secondary unit abhi active hai bilkul normal hai. Aur failover link addresses failover par swap nahi hote; data interface addresses hote hain.</p></div>

<div class="scn"><h4>Replace hua primary jisne ARP caches tod diye</h4><p>Hardware fault ke baad ek primary ASA replace hua. Swap ke dauraan secondary primary ke MACs ke saath active chala tha. Naya primary juda aur, kyunki koi virtual MACs configure nahi the, active MACs naye chassis ke burned-in MACs ban gaye. Upstream ISP router ka ARP timeout lamba tha aur uski policy mein static ARP jaisi binding thi, isliye internet traffic kai minute ruka raha jab tak ISP ne apni ARP entry clear nahi ki. Engineer ne phir saare data interfaces par virtual MACs configure kiye taaki aage ke replacements invisible rahein.</p><p><b>Seekh:</b> virtual MACs pair ki identity ko hardware se independent bana dete hain.</p></div>

<div class="iv"><p class="q">"ASA par primary/secondary aur active/standby mein kya fark hai?"</p><p>Strong answer: primary aur secondary fixed configured roles hain, <code>failover lan unit</code> se set hote hain; yeh failover link addressing, default active MACs aur dono ek saath boot hon to kaun jeetega, yeh tay karte hain. Active aur standby current states hain aur har failover par move hoti hain. Jodo ki data interfaces par ek active aur ek standby address hota hai jo state ke saath swap hote hain, jabki failover link addresses unit ke saath rehte hain, aur virtual MACs secondary ke akele boot hone ya hardware replace hone par MAC changes se bachate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Failover link: hellos, states, configuration replication; koi nameif nahi.</li>
<li>State link: connections, xlates, SAs; failover link ke saath shared ya, behtar, dedicated.</li>
<li>Primary/secondary fixed labels hain; Active/Standby Ready states hain jo move hoti hain.</li>
<li>Data interfaces <code>ip address A M standby B</code> use karte hain; active IP aur MAC Active state ke saath chalte hain.</li>
<li>Virtual MACs secondary ke akele boot hone ya unit replace hone par MAC changes se bachate hain.</li>
</ul></div>
`}};export{e as default};