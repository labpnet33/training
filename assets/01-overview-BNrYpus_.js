var e={id:`overview`,h:{en:`IS-IS for the SP core: what you will learn and the big picture`,hi:`SP core ke liye IS-IS: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will build, read and troubleshoot <b>IS-IS</b> (Intermediate System to Intermediate System) the way SPCOR 350-501 expects: how a router is named by a NET, what the PDUs and TLVs carry, how level-1, level-2 and level-1-2 routers form adjacencies, how a DIS works on a LAN, how the attached bit gives an area a default route, how route leaking and the overload bit work, and how to troubleshoot a silent adjacency. Everything runs on <b>IOS XE-style</b> routers in the simulator, with real command output.</p>
<p><b>Prerequisites.</b> The free <b>spcor-start</b> module (what an IGP does in a provider core) and the OSPF ideas from CCNA or ENARSI: link-state database, SPF, adjacency, metric. No IS-IS knowledge is assumed.</p>

<h3>Analogy: districts and a ring road</h3>
<p>Imagine a large city. Each district publishes a detailed street map that only district officers need: that is <b>level 1</b>. The city also publishes a ring-road map connecting the districts: that is <b>level 2</b>. A district officer who also sits on the ring-road committee holds both maps: that is a <b>level-1-2</b> router. When a district resident needs to go to another district, the local map says nothing, so the officer answers "take the exit to the ring road", which is the <b>default route</b> that the attached bit creates. The whole IS-IS design is this idea: small local maps, one backbone map, and level-1-2 routers in between.</p>

<h3>Why IS-IS in a provider</h3>
<ul>
<li><b>It runs directly on layer 2.</b> IS-IS packets ride in the data link frame (CLNS), not in IP. An IP misconfiguration cannot break the adjacency, and a remote host cannot send IS-IS packets to your router across the internet.</li>
<li><b>TLVs make it extensible.</b> Features such as IPv6, wide metrics, traffic engineering and segment routing arrive as new TLVs in the same LSPs.</li>
<li><b>One backbone, simple hierarchy.</b> Two levels are enough for networks with hundreds of routers, and many providers run a single level-2 domain.</li>
<li><b>Stable under change.</b> An IS-IS router belongs to one area as a whole, so area borders are links, not routers.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="The lab topology: two areas">
<rect x="10" y="30" width="290" height="150" rx="14" fill="#e2e8f0"/><text x="155" y="55" text-anchor="middle" class="svg-muted" font-size="12">Area 49.0001</text>
<rect x="340" y="30" width="290" height="150" rx="14" fill="#e2e8f0"/><text x="485" y="55" text-anchor="middle" class="svg-muted" font-size="12">Area 49.0002</text>
<rect x="30" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="70" y="108" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="70" y="125" text-anchor="middle" class="svg-muted" font-size="11">L1</text>
<rect x="200" y="85" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="108" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="240" y="125" text-anchor="middle" class="svg-muted" font-size="11">L1-2</text>
<rect x="360" y="85" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="108" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="400" y="125" text-anchor="middle" class="svg-muted" font-size="11">L1-2</text>
<rect x="530" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="570" y="108" text-anchor="middle" class="svg-ink" font-size="13">R4</text><text x="570" y="125" text-anchor="middle" class="svg-muted" font-size="11">L1</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="110" x2="200" y2="110"/><line x1="280" y1="110" x2="360" y2="110"/><line x1="440" y1="110" x2="530" y2="110"/></g>
<text x="155" y="102" text-anchor="middle" class="svg-muted" font-size="11">L1</text><text x="320" y="102" text-anchor="middle" class="svg-accent" font-size="11">L2</text><text x="485" y="102" text-anchor="middle" class="svg-muted" font-size="11">L1</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">The area border is the link R2-R3, not a router</text>
</svg><p class="cap">The module lab: four routers, two areas, one level-2 link between the border routers.</p></div>

<h3>Your first IS-IS in six lines</h3>
<p>The first lab (spcor-isis-two-areas) asks you to start IS-IS on four routers. On R2, a level-1-2 border router, the whole job is this reference configuration (taken from the lab solution):</p>
<pre class="code"><span class="c">! R2 - IOS XE style</span>
router isis
 net 49.0001.0000.0000.0002.00
interface Loopback0
 ip router isis
interface GigabitEthernet0/0
 ip router isis
 isis network point-to-point
interface GigabitEthernet0/1
 ip router isis
 isis network point-to-point</pre>
<p>The same lab, a few seconds later, on R2:</p>
<pre class="out">R2# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id
R1              L1   Gi0/0         10.1.12.1       <span class="hl">UP</span>    27       00
R3              L2   Gi0/1         10.1.23.3       <span class="hl">UP</span>    27       00</pre>
<p>Notice the Type column: R1 is a level-1 neighbour, R3 a level-2 neighbour. R2 holds both because it is level-1-2. Each of the next chapters explains one part of this picture.</p>

<div class="eg"><p><b>Worked example.</b> Metro Fibre wants Pune and Nashik in separate areas so that a flap in a Nashik access link does not trigger SPF in Pune. The engineer gives Pune routers the area 49.0001 and Nashik routers 49.0002, makes the two border routers level-1-2, and leaves the access routers level-1. Access routers hold only their own area; the border routers hold both and join the areas to each other.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>ip router isis</code> on the loopback. The router forms adjacencies on its links but nobody can reach its loopback, so BGP and LDP sessions to it never come up.</p></div>
<div class="exam"><p><b>Exam trap.</b> On IOS the default router type is <b>level-1-2</b>, and the default metric style is <b>narrow</b>. Expect questions where a router behaves strangely because nobody set <code>is-type</code> or <code>metric-style</code>.</p></div>

<div class="scn"><h4>Silent core after a new router</h4><p>A provider added router R9 to its IS-IS core and everything worked, except nobody could ping R9's loopback. The loopback interface was up but had no <code>ip router isis</code> line. Adding it advertised the prefix in R9's LSP and the ping worked immediately.</p><p><b>Lesson:</b> in IS-IS you enable the protocol per interface, and the loopback is an interface like any other.</p></div>

<div class="iv"><p class="q">"Why does IS-IS not depend on IP?"</p><p>IS-IS was designed for the OSI protocol suite and its PDUs are carried directly in layer 2 frames (CLNS). It carries IP prefixes as data inside TLVs. So IS-IS adjacencies do not need IP connectivity, and the protocol is naturally limited to directly connected neighbours, which is good for security.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS is a link-state IGP that runs directly on layer 2 and carries data in TLVs.</li>
<li>Level 1 is inside an area, level 2 is the backbone, level-1-2 routers do both.</li>
<li>Area borders are links, because a router belongs to one area as a whole.</li>
<li>On IOS you enable it with a NET under router isis and ip router isis per interface.</li>
<li>IOS defaults: level-1-2, narrow metrics, distance 115, metric 10 per link.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap <b>IS-IS</b> (Intermediate System to Intermediate System) ko waise build, read aur troubleshoot karoge jaise SPCOR 350-501 expect karta hai: router ko NET kaise naam deta hai, PDUs aur TLVs kya le jaate hain, level-1, level-2 aur level-1-2 routers adjacency kaise banate hain, LAN par DIS kaise kaam karta hai, attached bit area ko default route kaise deta hai, route leaking aur overload bit kaise kaam karte hain, aur chup adjacency ko troubleshoot kaise karte hain. Sab kuch simulator mein <b>IOS XE-style</b> routers par real command output ke saath chalta hai.</p>
<p><b>Prerequisites.</b> Free <b>spcor-start</b> module (provider core mein IGP kya karta hai) aur CCNA ya ENARSI ke OSPF ideas: link-state database, SPF, adjacency, metric. IS-IS ka koi knowledge assume nahi kiya gaya.</p>

<h3>Analogy: districts aur ring road</h3>
<p>Ek bade city ki kalpana karo. Har district apna detailed street map publish karta hai jo sirf district officers ko chahiye: yeh <b>level 1</b> hai. City ek ring-road map bhi publish karta hai jo districts ko jodta hai: yeh <b>level 2</b> hai. Jo district officer ring-road committee mein bhi baithta hai woh dono maps rakhta hai: yeh <b>level-1-2</b> router hai. Jab district ke resident ko doosre district jaana ho, to local map kuch nahi kehta, isliye officer kehta hai "ring road ka exit lo", yahi <b>default route</b> hai jo attached bit banata hai. Poora IS-IS design yahi idea hai: chhote local maps, ek backbone map, aur beech mein level-1-2 routers.</p>

<h3>Provider mein IS-IS kyun</h3>
<ul>
<li><b>Yeh seedha layer 2 par chalta hai.</b> IS-IS packets data link frame mein jaate hain (CLNS), IP mein nahi. IP misconfiguration adjacency nahi tod sakta, aur internet ke paar se koi remote host aapke router ko IS-IS packets nahi bhej sakta.</li>
<li><b>TLVs ise extensible banate hain.</b> IPv6, wide metrics, traffic engineering aur segment routing jaise features usi LSPs mein naye TLVs ki tarah aate hain.</li>
<li><b>Ek backbone, simple hierarchy.</b> Saikdon routers wale networks ke liye do levels kaafi hain, aur kai providers single level-2 domain chalate hain.</li>
<li><b>Change ke neeche stable.</b> IS-IS router poora ek hi area ka hota hai, isliye area borders routers nahi, links hote hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology: do areas">
<rect x="10" y="30" width="290" height="150" rx="14" fill="#e2e8f0"/><text x="155" y="55" text-anchor="middle" class="svg-muted" font-size="12">Area 49.0001</text>
<rect x="340" y="30" width="290" height="150" rx="14" fill="#e2e8f0"/><text x="485" y="55" text-anchor="middle" class="svg-muted" font-size="12">Area 49.0002</text>
<rect x="30" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="70" y="108" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="70" y="125" text-anchor="middle" class="svg-muted" font-size="11">L1</text>
<rect x="200" y="85" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="108" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="240" y="125" text-anchor="middle" class="svg-muted" font-size="11">L1-2</text>
<rect x="360" y="85" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="108" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="400" y="125" text-anchor="middle" class="svg-muted" font-size="11">L1-2</text>
<rect x="530" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="570" y="108" text-anchor="middle" class="svg-ink" font-size="13">R4</text><text x="570" y="125" text-anchor="middle" class="svg-muted" font-size="11">L1</text>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="110" x2="200" y2="110"/><line x1="280" y1="110" x2="360" y2="110"/><line x1="440" y1="110" x2="530" y2="110"/></g>
<text x="155" y="102" text-anchor="middle" class="svg-muted" font-size="11">L1</text><text x="320" y="102" text-anchor="middle" class="svg-accent" font-size="11">L2</text><text x="485" y="102" text-anchor="middle" class="svg-muted" font-size="11">L1</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Area border R2-R3 link hai, router nahi</text>
</svg><p class="cap">Module ka lab: chaar routers, do areas, border routers ke beech ek level-2 link.</p></div>

<h3>Aapka pehla IS-IS chhe lines mein</h3>
<p>Pehla lab (spcor-isis-two-areas) chaar routers par IS-IS start karne ko kehta hai. R2 par, jo level-1-2 border router hai, poora kaam yeh reference configuration hai (lab solution se liya gaya):</p>
<pre class="code"><span class="c">! R2 - IOS XE style</span>
router isis
 net 49.0001.0000.0000.0002.00
interface Loopback0
 ip router isis
interface GigabitEthernet0/0
 ip router isis
 isis network point-to-point
interface GigabitEthernet0/1
 ip router isis
 isis network point-to-point</pre>
<p>Usi lab mein kuch seconds baad R2 par:</p>
<pre class="out">R2# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id
R1              L1   Gi0/0         10.1.12.1       <span class="hl">UP</span>    27       00
R3              L2   Gi0/1         10.1.23.3       <span class="hl">UP</span>    27       00</pre>
<p>Type column dekho: R1 level-1 neighbour hai, R3 level-2 neighbour. R2 dono rakhta hai kyunki woh level-1-2 hai. Agle chapters is picture ka ek-ek hissa samjhate hain.</p>

<div class="eg"><p><b>Worked example.</b> Metro Fibre chahta hai ki Pune aur Nashik alag areas mein hon taaki Nashik ke access link ke flap se Pune mein SPF na chale. Engineer Pune routers ko area 49.0001 aur Nashik routers ko 49.0002 deta hai, do border routers ko level-1-2 banata hai, aur access routers level-1 rakhta hai. Access routers sirf apna area rakhte hain; border routers dono rakhte hain aur areas ko aapas mein jodte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Loopback par <code>ip router isis</code> bhool jaana. Router apne links par adjacency banata hai par koi uske loopback tak nahi pahunch pata, isliye uske BGP aur LDP sessions kabhi up nahi hote.</p></div>
<div class="exam"><p><b>Exam trap.</b> IOS par default router type <b>level-1-2</b> hai, aur default metric style <b>narrow</b>. Aise sawal aate hain jahan router ajeeb behave karta hai kyunki kisi ne <code>is-type</code> ya <code>metric-style</code> set nahi kiya.</p></div>

<div class="scn"><h4>Naye router ke baad chup core</h4><p>Ek provider ne IS-IS core mein router R9 jodha aur sab chala, siway iske ki koi R9 ke loopback ko ping nahi kar pa raha tha. Loopback interface up tha par uspar <code>ip router isis</code> line nahi thi. Use jodne se prefix R9 ke LSP mein advertise hua aur ping turant chala.</p><p><b>Lesson:</b> IS-IS mein protocol har interface par enable karte hain, aur loopback bhi doosre interface jaisa ek interface hai.</p></div>

<div class="iv"><p class="q">"IS-IS IP par depend kyun nahi karta?"</p><p>IS-IS OSI protocol suite ke liye design hua tha aur uske PDUs seedha layer 2 frames mein jaate hain (CLNS). Woh IP prefixes ko TLVs ke andar data ki tarah le jaata hai. Isliye IS-IS adjacencies ko IP connectivity nahi chahiye, aur protocol swabhaavik roop se directly connected neighbours tak limited hai, jo security ke liye accha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS link-state IGP hai jo seedha layer 2 par chalta hai aur data TLVs mein le jaata hai.</li>
<li>Level 1 area ke andar, level 2 backbone, level-1-2 routers dono karte hain.</li>
<li>Area borders links hote hain, kyunki router poora ek hi area ka hota hai.</li>
<li>IOS par router isis ke neeche NET aur har interface par ip router isis se enable karte hain.</li>
<li>IOS defaults: level-1-2, narrow metrics, distance 115, har link metric 10.</li>
</ul></div>
`}};export{e as default};