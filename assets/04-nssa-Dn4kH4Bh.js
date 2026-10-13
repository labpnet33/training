var e={id:`nssa`,h:{en:`NSSA: type-7 LSAs, the P-bit and translation (lab: Nagpur)`,hi:`NSSA: type-7 LSAs, P-bit aur translation (lab: Nagpur)`},body:{en:`
<p>Go back to the village at the end of the road. It does not want the country's full map, but it has one small factory that receives goods from a partner company by a private lane. The village must tell the rest of the country about that lane. A stub area cannot do this, because routers in a stub area are not allowed to redistribute. The <b>not-so-stubby area (NSSA)</b>, defined in RFC 3101, solves exactly this problem.</p>

<h3>How an NSSA works, step by step</h3>
<ol>
<li>Every router in the area is configured with <code>area 30 nssa</code>. Like the stub flag, this is carried in the Hello options (the <b>N/P-bit</b>) and must match on both neighbours, or they never form an adjacency.</li>
<li>The ABR blocks type-5 and type-4 LSAs, exactly like a stub area. Type-3 summaries still enter.</li>
<li>A router inside the NSSA that redistributes (a local ASBR) cannot create type-5 LSAs. It creates <b>type-7 NSSA external LSAs</b> instead. Inside the area they show as <code>O N2</code> (default) or <code>O N1</code>.</li>
<li>Type-7 LSAs never leave the NSSA. The ABR <b>translates</b> each type-7 whose <b>P-bit</b> (propagate bit) is set into a brand-new <b>type-5</b> LSA and floods it into area 0. Other areas see <code>O E2</code> or <code>O E1</code>, with the ABR as the advertising router.</li>
<li>No default route is injected automatically. You add one with <code>area 30 nssa default-information-originate</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NSSA type-7 to type-5 translation">
<rect x="10" y="30" width="300" height="170" rx="10" fill="#fde68a"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 30 (NSSA)</text>
<rect x="350" y="30" width="280" height="170" rx="10" fill="#bae6fd"/><text x="490" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<rect x="30" y="85" width="120" height="50" rx="8" fill="#ffffff" stroke="#64748b"/><text x="90" y="106" text-anchor="middle" class="svg-ink" font-size="13">BR (ASBR)</text><text x="90" y="124" text-anchor="middle" class="svg-muted" font-size="12">Lo5 172.31.0.0/24</text>
<rect x="270" y="85" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="106" text-anchor="middle" class="svg-ink" font-size="13">ABR</text><text x="325" y="124" text-anchor="middle" class="svg-muted" font-size="12">translator</text>
<rect x="500" y="85" width="110" height="50" rx="8" fill="#ffffff" stroke="#64748b"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">CORE</text>
<line x1="150" y1="100" x2="270" y2="100" stroke="#64748b" stroke-width="2"/><text x="210" y="92" text-anchor="middle" class="svg-accent" font-size="12">type-7, P-bit set</text>
<line x1="380" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/><text x="440" y="92" text-anchor="middle" class="svg-accent" font-size="12">new type-5</text>
<line x1="270" y1="125" x2="150" y2="125" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="210" y="150" text-anchor="middle" class="svg-muted" font-size="12">type-7 default (O*N2)</text>
<text x="325" y="180" text-anchor="middle" class="svg-ink" font-size="12">ABR sees O N2</text>
<text x="555" y="180" text-anchor="middle" class="svg-ink" font-size="12">CORE sees O E2</text>
</svg><p class="cap">The same prefix wears two labels: N2 inside the NSSA, E2 everywhere else. The default goes the opposite way as a type-7.</p></div>

<h3>Lab walk-through: Nagpur branch, area 30</h3>
<p>BR has a partner network 172.31.0.0/24 on Loopback5, outside OSPF. The branch must stop receiving the company's external routes but advertise the partner network.</p>
<pre class="code"><span class="c">! BR and ABR</span>
router ospf 1
 area 30 nssa
<span class="c">! BR: become the local ASBR</span>
router ospf 1
 redistribute connected subnets
<span class="c">! ABR: give the branch a default route</span>
router ospf 1
 area 30 nssa default-information-originate</pre>
<pre class="out">BR#show ip ospf database nssa-external

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Type-7 AS External Link States (Area 30)

  LS age: 31
<span class="hl">  Options: (No TOS-capability, Type 7/5 translation, DC, Upward)</span>
  LS Type: AS External Link
  Link State ID: 172.31.0.0 (External Network Number )
  Advertising Router: 1.1.1.1
  Network Mask: /24
        Metric Type: 2 (Larger than any link state path)
        Metric: 20
<span class="hl">        Forward Address: 1.1.1.1</span>
        External Route Tag: 0

ABR#show ip ospf | section Area 30
    Area 30
        Number of interfaces in this area is 1
        It is a NSSA area
<span class="hl">        Perform type-7/type-5 LSA translation</span>

ABR#show ip route ospf | include 172.31
<span class="hl">O N2     172.31.0.0 [110/20] via 10.30.12.1, 00:01:02, GigabitEthernet0/0</span>

CORE#show ip ospf database external 172.31.0.0 | include Advertising|Forward
<span class="hl">  Advertising Router: 2.2.2.2</span>
        Forward Address: 1.1.1.1

CORE#show ip route ospf | include 172.31
<span class="hl">O E2     172.31.0.0 [110/20] via 10.0.23.1, 00:00:58, GigabitEthernet0/0</span>

BR#show ip route ospf | include 0.0.0.0
<span class="hl">O*N2  0.0.0.0/0 [110/1] via 10.30.12.2, 00:00:20, GigabitEthernet0/0</span></pre>
<p>Read the evidence carefully. "Type 7/5 translation" in the options is how IOS displays the <b>P-bit</b>. The type-7 carries a non-zero <b>forwarding address</b> (an address of the NSSA ASBR), and the translated type-5 keeps it. The ABR, 2.2.2.2, is the advertising router of the type-5, so CORE treats the ABR as the ASBR for this prefix. Finally, <code>ping 203.0.113.1</code> from BR and <code>ping 172.31.0.1</code> from CORE prove both directions.</p>

<h3>Details the exam likes</h3>
<ul>
<li><b>Translator election.</b> If an NSSA has several ABRs, the one with the highest router ID translates. <code>area 30 nssa translate type7 always</code> forces a specific ABR to translate.</li>
<li><b>P-bit clear.</b> When the ASBR is itself the NSSA ABR, it already originates type-5 into area 0, so the type-7 it floods into the NSSA has the P-bit clear and is not translated again. <code>area 30 nssa no-redistribution</code> on such a router stops it from creating type-7 LSAs at all.</li>
<li><b>Summarising.</b> The translating ABR can summarise translated externals with <code>summary-address</code>, because at that moment it is acting as an ASBR.</li>
<li><b>Default route on a non-ABR.</b> <code>area 30 nssa default-information-originate</code> on an internal NSSA ASBR only works if that router has a default route in its own routing table. On the ABR no such route is needed.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Before the lab BR held 5 OSPF routes: three O IA, one O E2 (203.0.113.0/24) and O*E2. After <code>area 30 nssa</code> it has three O IA routes and no default at all, so <code>ping 203.0.113.1</code> fails. After <code>default-information-originate</code> on the ABR it has three O IA plus O*N2 [110/1]: the ABR advertises metric 1 and, because N2 is a type-2 metric, BR does not add its link cost.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting an automatic default in a plain NSSA (only stub, totally stubby and totally NSSA get one). Forgetting the <code>subnets</code> keyword on older IOS, so only classful networks are redistributed. Configuring <code>area 30 nssa</code> on only one side and then chasing a "route" problem that is really a neighbour problem.</p></div>

<div class="exam"><p><b>Exam trap.</b> Inside the NSSA the partner prefix is <code>O N2</code>; in area 0 and other areas it is <code>O E2</code> with the ABR as advertising router. If a question shows a type-7 LSA in area 0, the answer is "impossible": type-7 is area-scoped.</p></div>

<div class="scn"><h4>The branch that lost the internet after going NSSA</h4><p>A team converted a stub branch area to NSSA so a new partner router could be connected. The partner routes appeared at the core as E2, but every user in the branch lost internet access. <code>show ip route 0.0.0.0</code> on the branch router returned "% Network not in table". The stub area had given them an automatic O*IA default; the NSSA did not. Adding <code>area 30 nssa default-information-originate</code> on the ABR restored access with an O*N2 default.</p><p><b>Lesson:</b> when you change area type, write down what happens to the default route before you press Enter.</p></div>

<div class="iv"><p class="q">"Explain how an external route from an NSSA reaches area 0."</p><p>Strong answer: the ASBR in the NSSA originates a type-7 LSA with the P-bit set, visible as O N1 or N2 inside the area. The NSSA ABR (the translator, highest router ID if there are several) converts it into a new type-5 with itself as advertising router, keeping the forwarding address, and floods it to area 0, where it appears as O E1 or E2. Mention that NSSA gets no automatic default and that <code>show ip ospf</code> on the ABR confirms "Perform type-7/type-5 LSA translation".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSSA = stub behaviour (no type-4/5 in) plus a local ASBR using type-7 LSAs.</li>
<li>Type-7 shows as O N1/N2 inside, never leaves the area, and is translated to type-5 by the ABR.</li>
<li>The P-bit ("Type 7/5 translation" in options) tells the ABR to translate.</li>
<li>No automatic default: use <code>area X nssa default-information-originate</code> for an O*N2 default.</li>
<li><code>area X nssa</code> must match on every router in the area.</li>
</ul></div>
`,hi:`
<p>Sadak ke end wale gaon par wapas chalo. Use desh ka poora map nahi chahiye, lekin uski ek chhoti factory hai jo ek private lane se partner company ka maal leti hai. Gaon ko baaki desh ko us lane ke baare mein batana hai. Stub area yeh nahi kar sakta, kyunki stub area ke routers ko redistribute karne ki permission nahi. RFC 3101 mein define kiya gaya <b>not-so-stubby area (NSSA)</b> bilkul yahi problem solve karta hai.</p>

<h3>NSSA kaise kaam karta hai, step by step</h3>
<ol>
<li>Area ke har router par <code>area 30 nssa</code> configure hota hai. Stub flag ki tarah yeh Hello options (<b>N/P-bit</b>) mein jaata hai aur dono neighbours par match hona chahiye, warna adjacency kabhi nahi banti.</li>
<li>ABR type-5 aur type-4 LSAs ko rokta hai, bilkul stub area ki tarah. Type-3 summaries ab bhi aati hain.</li>
<li>NSSA ke andar redistribute karne wala router (local ASBR) type-5 LSAs nahi bana sakta. Uski jagah woh <b>type-7 NSSA external LSAs</b> banata hai. Area ke andar woh <code>O N2</code> (default) ya <code>O N1</code> dikhte hain.</li>
<li>Type-7 LSAs kabhi NSSA se bahar nahi jaate. ABR har us type-7 ko jiska <b>P-bit</b> (propagate bit) set hai, ek bilkul naye <b>type-5</b> LSA mein <b>translate</b> karta hai aur area 0 mein flood karta hai. Doosre areas ko <code>O E2</code> ya <code>O E1</code> dikhta hai, advertising router ABR ke saath.</li>
<li>Koi default route apne aap inject nahi hota. Aap <code>area 30 nssa default-information-originate</code> se jodte ho.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NSSA type-7 se type-5 translation">
<rect x="10" y="30" width="300" height="170" rx="10" fill="#fde68a"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 30 (NSSA)</text>
<rect x="350" y="30" width="280" height="170" rx="10" fill="#bae6fd"/><text x="490" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<rect x="30" y="85" width="120" height="50" rx="8" fill="#ffffff" stroke="#64748b"/><text x="90" y="106" text-anchor="middle" class="svg-ink" font-size="13">BR (ASBR)</text><text x="90" y="124" text-anchor="middle" class="svg-muted" font-size="12">Lo5 172.31.0.0/24</text>
<rect x="270" y="85" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="106" text-anchor="middle" class="svg-ink" font-size="13">ABR</text><text x="325" y="124" text-anchor="middle" class="svg-muted" font-size="12">translator</text>
<rect x="500" y="85" width="110" height="50" rx="8" fill="#ffffff" stroke="#64748b"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">CORE</text>
<line x1="150" y1="100" x2="270" y2="100" stroke="#64748b" stroke-width="2"/><text x="210" y="92" text-anchor="middle" class="svg-accent" font-size="12">type-7, P-bit set</text>
<line x1="380" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/><text x="440" y="92" text-anchor="middle" class="svg-accent" font-size="12">naya type-5</text>
<line x1="270" y1="125" x2="150" y2="125" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="210" y="150" text-anchor="middle" class="svg-muted" font-size="12">type-7 default (O*N2)</text>
<text x="325" y="180" text-anchor="middle" class="svg-ink" font-size="12">ABR ko O N2 dikhta hai</text>
<text x="555" y="180" text-anchor="middle" class="svg-ink" font-size="12">CORE ko O E2 dikhta hai</text>
</svg><p class="cap">Ek hi prefix do label pehenta hai: NSSA ke andar N2, baaki har jagah E2. Default ulti direction mein type-7 ke roop mein jaata hai.</p></div>

<h3>Lab walk-through: Nagpur branch, area 30</h3>
<p>BR ke paas Loopback5 par partner network 172.31.0.0/24 hai, OSPF ke bahar. Branch ko company ke external routes lena band karna hai lekin partner network advertise karna hai.</p>
<pre class="code"><span class="c">! BR aur ABR</span>
router ospf 1
 area 30 nssa
<span class="c">! BR: local ASBR bano</span>
router ospf 1
 redistribute connected subnets
<span class="c">! ABR: branch ko default route do</span>
router ospf 1
 area 30 nssa default-information-originate</pre>
<pre class="out">BR#show ip ospf database nssa-external

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Type-7 AS External Link States (Area 30)

  LS age: 31
<span class="hl">  Options: (No TOS-capability, Type 7/5 translation, DC, Upward)</span>
  LS Type: AS External Link
  Link State ID: 172.31.0.0 (External Network Number )
  Advertising Router: 1.1.1.1
  Network Mask: /24
        Metric Type: 2 (Larger than any link state path)
        Metric: 20
<span class="hl">        Forward Address: 1.1.1.1</span>
        External Route Tag: 0

ABR#show ip ospf | section Area 30
    Area 30
        Number of interfaces in this area is 1
        It is a NSSA area
<span class="hl">        Perform type-7/type-5 LSA translation</span>

ABR#show ip route ospf | include 172.31
<span class="hl">O N2     172.31.0.0 [110/20] via 10.30.12.1, 00:01:02, GigabitEthernet0/0</span>

CORE#show ip ospf database external 172.31.0.0 | include Advertising|Forward
<span class="hl">  Advertising Router: 2.2.2.2</span>
        Forward Address: 1.1.1.1

CORE#show ip route ospf | include 172.31
<span class="hl">O E2     172.31.0.0 [110/20] via 10.0.23.1, 00:00:58, GigabitEthernet0/0</span>

BR#show ip route ospf | include 0.0.0.0
<span class="hl">O*N2  0.0.0.0/0 [110/1] via 10.30.12.2, 00:00:20, GigabitEthernet0/0</span></pre>
<p>Evidence dhyaan se padho. Options mein "Type 7/5 translation" wahi tareeka hai jisse IOS <b>P-bit</b> dikhata hai. Type-7 ek non-zero <b>forwarding address</b> (NSSA ASBR ka ek address) le jaata hai, aur translate hua type-5 use rakhta hai. ABR, 2.2.2.2, type-5 ka advertising router hai, isliye CORE is prefix ke liye ABR ko ASBR maanta hai. Aakhir mein BR se <code>ping 203.0.113.1</code> aur CORE se <code>ping 172.31.0.1</code> dono directions prove karte hain.</p>

<h3>Details jo exam ko pasand hain</h3>
<ul>
<li><b>Translator election.</b> Agar NSSA mein kai ABRs hain, to highest router ID wala translate karta hai. <code>area 30 nssa translate type7 always</code> kisi specific ABR ko translate karne par majboor karta hai.</li>
<li><b>P-bit clear.</b> Jab ASBR khud NSSA ABR hota hai, to woh pehle se area 0 mein type-5 originate karta hai, isliye NSSA mein flood hone wale uske type-7 ka P-bit clear hota hai aur dobara translate nahi hota. Aise router par <code>area 30 nssa no-redistribution</code> use type-7 LSAs banane se hi rok deta hai.</li>
<li><b>Summarising.</b> Translate karne wala ABR translated externals ko <code>summary-address</code> se summarise kar sakta hai, kyunki us waqt woh ASBR ki tarah kaam kar raha hota hai.</li>
<li><b>Non-ABR par default route.</b> Internal NSSA ASBR par <code>area 30 nssa default-information-originate</code> tabhi kaam karta hai jab us router ki apni routing table mein default route ho. ABR par aisa route zaroori nahi.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab se pehle BR ke paas 5 OSPF routes the: teen O IA, ek O E2 (203.0.113.0/24) aur O*E2. <code>area 30 nssa</code> ke baad uske paas teen O IA routes hain aur koi default nahi, isliye <code>ping 203.0.113.1</code> fail hota hai. ABR par <code>default-information-originate</code> ke baad uske paas teen O IA aur O*N2 [110/1] hain: ABR metric 1 advertise karta hai aur, kyunki N2 type-2 metric hai, BR apni link cost nahi jodta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Plain NSSA mein automatic default expect karna (sirf stub, totally stubby aur totally NSSA ko milta hai). Purane IOS par <code>subnets</code> keyword bhoolna, jisse sirf classful networks redistribute hote hain. Sirf ek side par <code>area 30 nssa</code> configure karke phir "route" problem dhoondhna jo asal mein neighbour problem hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> NSSA ke andar partner prefix <code>O N2</code> hai; area 0 aur doosre areas mein <code>O E2</code>, advertising router ABR ke saath. Agar koi question area 0 mein type-7 LSA dikhaye, to jawab hai "impossible": type-7 area-scoped hai.</p></div>

<div class="scn"><h4>NSSA banne ke baad jis branch ka internet chala gaya</h4><p>Ek team ne stub branch area ko NSSA mein convert kiya taaki naya partner router joda ja sake. Partner routes core par E2 ke roop mein aa gaye, lekin branch ke har user ka internet chala gaya. Branch router par <code>show ip route 0.0.0.0</code> ne "% Network not in table" diya. Stub area unhe automatic O*IA default deta tha; NSSA nahi deta. ABR par <code>area 30 nssa default-information-originate</code> jodne se O*N2 default ke saath access wapas aa gaya.</p><p><b>Lesson:</b> area type badalte waqt Enter dabane se pehle likh lo ki default route ka kya hoga.</p></div>

<div class="iv"><p class="q">"Samjhao ki NSSA ka external route area 0 tak kaise pahunchta hai."</p><p>Strong answer: NSSA ka ASBR P-bit set ke saath type-7 LSA originate karta hai, jo area ke andar O N1 ya N2 dikhta hai. NSSA ABR (translator, kai hon to highest router ID wala) use ek naye type-5 mein convert karta hai jiska advertising router woh khud hai, forwarding address rakhta hai, aur area 0 mein flood karta hai, jahan woh O E1 ya E2 dikhta hai. Yeh bhi batao ki NSSA ko automatic default nahi milta aur ABR par <code>show ip ospf</code> "Perform type-7/type-5 LSA translation" confirm karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSSA = stub behaviour (andar type-4/5 nahi) plus type-7 LSAs use karne wala local ASBR.</li>
<li>Type-7 andar O N1/N2 dikhta hai, area kabhi nahi chhodta, aur ABR use type-5 mein translate karta hai.</li>
<li>P-bit (options mein "Type 7/5 translation") ABR ko translate karne ko kehta hai.</li>
<li>Automatic default nahi: O*N2 default ke liye <code>area X nssa default-information-originate</code> use karo.</li>
<li><code>area X nssa</code> area ke har router par match hona chahiye.</li>
</ul></div>
`}};export{e as default};