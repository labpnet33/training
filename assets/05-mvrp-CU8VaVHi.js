var e={id:`mvrp`,h:{en:`MVRP: letting VLANs register themselves on trunks`,hi:`MVRP: VLANs ko trunks par khud register hone dena`},body:{en:`
<p>On a campus with many access switches, a new VLAN means touching every trunk on the path from the access switch to the core. Forget one and the users behind it have no network. Forget to remove one and the trunk keeps carrying broadcasts for a VLAN nobody uses. The <b>Multiple VLAN Registration Protocol (MVRP, IEEE 802.1ak)</b> automates it: a switch tells its neighbour which VLANs it needs, and the neighbour adds those VLANs to the trunk.</p>

<h3>The declaration model</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MVRP declaration">
<rect x="20" y="70" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="80" y="97" text-anchor="middle" class="svg-ink" font-size="14">ACC2</text><text x="80" y="116" text-anchor="middle" class="svg-muted" font-size="11">uses VLAN 20</text>
<rect x="260" y="70" width="120" height="60" rx="10" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">CORE</text>
<rect x="500" y="70" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="97" text-anchor="middle" class="svg-ink" font-size="14">ACC1</text><text x="560" y="116" text-anchor="middle" class="svg-muted" font-size="11">uses VLAN 10, 30</text>
<line x1="140" y1="100" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><line x1="380" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="200" y="85" text-anchor="middle" class="svg-accent" font-size="11">Join VLAN 20</text><text x="440" y="85" text-anchor="middle" class="svg-accent" font-size="11">Join VLAN 10, 30</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">CORE registers each VLAN on the port it heard it, and declares it on its other trunks</text>
</svg><p class="cap">Declarations flow from the edge toward the core and then back out to other switches that need them.</p></div>
<ul>
<li><b>Join and Leave.</b> A switch sends a Join for each VLAN it needs on a port and a Leave when it no longer does.</li>
<li><b>Registration.</b> The receiving port registers the VLAN as active on that port and creates the VLAN dynamically if it does not exist (when dynamic creation is allowed).</li>
<li><b>Propagation.</b> The VLAN is then declared out of the switch's other MVRP ports, so the path through the network is built hop by hop.</li>
<li><b>Timers.</b> Join, leave and leaveall timers pace the messages. The simulator reports them (join 200, leave 1000, leaveall 10000 ms).</li>
<li><b>Registration mode.</b> A port can be Normal (accepts registrations) or Forbidden (ignores every declaration and registers nothing).</li>
</ul>

<h3>Seeing it work in the lab</h3>
<p>MVRP is enabled by listing the trunk interfaces under <code>protocols mvrp</code>:</p>
<pre class="out">lab@CORE&gt; show configuration protocols mvrp
interface ge-0/0/1;
interface ge-0/0/2;</pre>
<p>With both ports enabled, CORE registers the VLANs that ACC1 and ACC2 need:</p>
<pre class="out">lab@CORE&gt; show mvrp

MVRP configuration
  MVRP status                 : Enabled
  Dynamic VLAN creation       : Enabled
  Timers (ms)                 : join 200, leave 1000, leaveall 10000

  Interface       Status     Registration   Registered VLANs
  ge-0/0/1.0      Enabled    Normal         10,30
  ge-0/0/2.0      Enabled    Normal         20</pre>
<p>On the access switch, the VLANs that the core needs are created as dynamic VLANs, named <code>__mvrp_ID__</code>. VLAN 20 was configured statically, so it keeps its own name:</p>
<pre class="out">lab@ACC2&gt; show mvrp dynamic-vlan-memberships

VLAN Name             Tag    Origin    Dynamically joined interfaces
__mvrp_10__           10     dynamic   ge-0/0/0.0
LABS                  20     static    ge-0/0/0.0
__mvrp_30__           30     dynamic   ge-0/0/0.0</pre>
<pre class="out">lab@ACC2&gt; show mvrp
  Interface       Status     Registration   Registered VLANs
  ge-0/0/0.0      Enabled    Normal         10,20,30</pre>
<p>This is the picture you want: ACC2 itself uses only VLAN 20, but it also learns 10 and 30 from the core so that VLANs behind other switches stay reachable.</p>

<h3>What dynamic registration does and does not do</h3>
<ul>
<li>It creates the VLAN and puts the trunk in it; it does <b>not</b> assign access ports to the VLAN. Users still need static membership (or a filter or dot1x).</li>
<li>It registers VLANs only through MVRP-enabled ports, so one switch without MVRP breaks the chain.</li>
<li>Dynamic VLANs are not saved in the configuration, which is why you check them with a show command.</li>
<li>It does not replace STP. It only controls membership.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A new classroom switch is plugged into the floor switch. MVRP on its uplink, plus a static VLAN 20 on its access ports, makes the floor and core trunks add VLAN 20 automatically. When the switch is removed, Leave messages and the leave timer remove VLAN 20 from the trunks that no longer need it.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling MVRP on only one end of a trunk, or enabling it everywhere and forgetting that user access ports still need membership. Another mistake is leaving a port in forbidden registration after a lock-down, which silently stops registrations (chapter 8 shows the incident).</p></div>
<div class="exam"><p><b>Exam trap.</b> MVRP is the VLAN registration protocol of 802.1ak and replaces the older GVRP. Know that the protocol only declares VLANs on trunk ports; it never moves hosts into a VLAN.</p></div>

<div class="scn"><h4>VLAN sprawl, solved and then broken</h4><p>A campus team turned on MVRP and removed 70 manually configured VLANs from the trunks. Later a security review set a port to forbidden registration to stop unplanned VLANs. Two weeks after, a lab VLAN failed on a new switch. The configuration was working as designed on the other ports, and the one forbidden port had no registered VLANs at all.</p><p><b>Lesson:</b> a security setting on one port can quietly turn off an automation for a whole branch of the network.</p></div>

<div class="iv"><p class="q">"What does MVRP do and how do you check it?"</p><p>It lets switches declare the VLANs they need on trunk ports, so neighbours add those VLANs and create them dynamically if needed. I check show mvrp for each port's status, registration mode and registered VLANs, and show mvrp dynamic-vlan-memberships for the dynamically created VLANs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MVRP (802.1ak) registers VLANs on trunks with Join and Leave messages.</li>
<li>It can create VLANs dynamically; they are named __mvrp_ID__.</li>
<li>It never assigns access ports to VLANs.</li>
<li>Normal registration accepts VLANs, forbidden ignores all of them.</li>
<li>Check with show mvrp and show mvrp dynamic-vlan-memberships.</li>
</ul></div>
`,hi:`
<p>Bahut saare access switches wale campus mein naye VLAN ka matlab hai access switch se core tak raaste ke har trunk ko chhuna. Ek bhool gaye to uske peeche ke users ka network gaya. Ek hatana bhool gaye to trunk us VLAN ka broadcast le jaata rehta hai jise koi use nahi karta. <b>Multiple VLAN Registration Protocol (MVRP, IEEE 802.1ak)</b> ise automate karta hai: switch padosi ko batata hai ki use kaunse VLANs chahiye, aur padosi un VLANs ko trunk mein jod leta hai.</p>

<h3>Declaration model</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MVRP declaration">
<rect x="20" y="70" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="80" y="97" text-anchor="middle" class="svg-ink" font-size="14">ACC2</text><text x="80" y="116" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20 use karta hai</text>
<rect x="260" y="70" width="120" height="60" rx="10" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">CORE</text>
<rect x="500" y="70" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="97" text-anchor="middle" class="svg-ink" font-size="14">ACC1</text><text x="560" y="116" text-anchor="middle" class="svg-muted" font-size="11">VLAN 10, 30 use karta hai</text>
<line x1="140" y1="100" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><line x1="380" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="200" y="85" text-anchor="middle" class="svg-accent" font-size="11">Join VLAN 20</text><text x="440" y="85" text-anchor="middle" class="svg-accent" font-size="11">Join VLAN 10, 30</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">CORE har VLAN ko us port par register karta hai jahan se suna, aur apne doosre trunks par declare karta hai</text>
</svg><p class="cap">Declarations edge se core ki taraf aur phir un doosre switches tak jaate hain jinhe chahiye.</p></div>
<ul>
<li><b>Join aur Leave.</b> Switch port par jis VLAN ki zaroorat ho uska Join bhejta hai aur zaroorat khatam hone par Leave.</li>
<li><b>Registration.</b> Receive karne wala port VLAN ko us port par active register karta hai aur agar VLAN maujood nahi to dynamically bana deta hai (jab dynamic creation allowed ho).</li>
<li><b>Propagation.</b> Phir VLAN switch ke doosre MVRP ports se declare hota hai, isliye network mein raasta hop by hop banta hai.</li>
<li><b>Timers.</b> Join, leave aur leaveall timers messages ki raftaar tay karte hain. Simulator inhe report karta hai (join 200, leave 1000, leaveall 10000 ms).</li>
<li><b>Registration mode.</b> Port Normal (registrations accept) ya Forbidden (har declaration ignore, kuch register nahi) ho sakta hai.</li>
</ul>

<h3>Lab mein kaam karte dekhna</h3>
<p>MVRP trunk interfaces ko <code>protocols mvrp</code> ke neeche list karke enable hota hai:</p>
<pre class="out">lab@CORE&gt; show configuration protocols mvrp
interface ge-0/0/1;
interface ge-0/0/2;</pre>
<p>Dono ports enable hone par CORE un VLANs ko register karta hai jo ACC1 aur ACC2 ko chahiye:</p>
<pre class="out">lab@CORE&gt; show mvrp

MVRP configuration
  MVRP status                 : Enabled
  Dynamic VLAN creation       : Enabled
  Timers (ms)                 : join 200, leave 1000, leaveall 10000

  Interface       Status     Registration   Registered VLANs
  ge-0/0/1.0      Enabled    Normal         10,30
  ge-0/0/2.0      Enabled    Normal         20</pre>
<p>Access switch par core ko jo VLANs chahiye woh dynamic VLANs ke roop mein bante hain, naam <code>__mvrp_ID__</code>. VLAN 20 static configure tha, isliye woh apna naam rakhta hai:</p>
<pre class="out">lab@ACC2&gt; show mvrp dynamic-vlan-memberships

VLAN Name             Tag    Origin    Dynamically joined interfaces
__mvrp_10__           10     dynamic   ge-0/0/0.0
LABS                  20     static    ge-0/0/0.0
__mvrp_30__           30     dynamic   ge-0/0/0.0</pre>
<pre class="out">lab@ACC2&gt; show mvrp
  Interface       Status     Registration   Registered VLANs
  ge-0/0/0.0      Enabled    Normal         10,20,30</pre>
<p>Yahi tasveer chahiye: ACC2 khud sirf VLAN 20 use karta hai, par woh core se 10 aur 30 bhi seekhta hai taaki doosre switches ke peeche ke VLANs reachable rahein.</p>

<h3>Dynamic registration kya karta hai aur kya nahi</h3>
<ul>
<li>Yeh VLAN banata hai aur trunk ko usme daalta hai; yeh access ports ko VLAN mein <b>nahi</b> daalta. Users ko phir bhi static membership (ya filter ya dot1x) chahiye.</li>
<li>Yeh VLANs sirf MVRP-enabled ports se register karta hai, isliye MVRP ke bina ek switch chain tod deta hai.</li>
<li>Dynamic VLANs configuration mein save nahi hote, isliye unhe show command se check karte hain.</li>
<li>Yeh STP ki jagah nahi leta. Sirf membership control karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Naya classroom switch floor switch mein lagaya. Uske uplink par MVRP aur access ports par static VLAN 20 se floor aur core trunks VLAN 20 apne aap jod lete hain. Switch hatane par Leave messages aur leave timer VLAN 20 ko un trunks se hata dete hain jinhe ab zaroorat nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Trunk ke sirf ek end par MVRP enable karna, ya har jagah enable karke bhool jaana ki user access ports ko phir bhi membership chahiye. Ek aur galti: lock-down ke baad port ko forbidden registration mein chhod dena, jo chupchaap registrations rok deta hai (chapter 8 mein incident dikhaya hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> MVRP 802.1ak ka VLAN registration protocol hai aur purane GVRP ki jagah leta hai. Yaad rakho ki protocol sirf trunk ports par VLANs declare karta hai; hosts ko kabhi VLAN mein nahi daalta.</p></div>

<div class="scn"><h4>VLAN sprawl, solve hua aur phir toota</h4><p>Ek campus team ne MVRP on kiya aur trunks se 70 manually configured VLANs hata diye. Baad mein security review ne unplanned VLANs rokne ke liye ek port ko forbidden registration par kar diya. Do hafte baad naye switch par ek lab VLAN fail ho gaya. Baaki ports par configuration design ke hisaab se chal rahi thi, aur woh ek forbidden port par koi VLAN registered hi nahi tha.</p><p><b>Lesson:</b> ek port ki security setting poori branch ke liye automation chupchaap band kar sakti hai.</p></div>

<div class="iv"><p class="q">"MVRP kya karta hai aur use kaise check karte ho?"</p><p>Yeh switches ko trunk ports par apne zaroori VLANs declare karne deta hai, taaki padosi woh VLANs jod lein aur zaroorat par dynamically bana dein. Main har port ke status, registration mode aur registered VLANs ke liye show mvrp dekhta hoon, aur dynamically bane VLANs ke liye show mvrp dynamic-vlan-memberships.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MVRP (802.1ak) trunks par Join aur Leave messages se VLANs register karta hai.</li>
<li>Yeh VLANs dynamically bana sakta hai; naam __mvrp_ID__ hote hain.</li>
<li>Yeh access ports ko kabhi VLANs mein nahi daalta.</li>
<li>Normal registration VLANs accept karta hai, forbidden sab ignore karta hai.</li>
<li>show mvrp aur show mvrp dynamic-vlan-memberships se check karo.</li>
</ul></div>
`}};export{e as default};