var e={id:`mst-concepts-config`,h:{en:`MST: regions, IST, MSTI, CIST and building the lab region`,hi:`MST: regions, IST, MSTI, CIST aur lab region banana`},body:{en:`
<p>A chain of franchise restaurants wants every outlet in a city to work as one team: share deliveries, cover each other's orders. The head office sends a rule book with a <b>name</b>, an <b>edition number</b> and a <b>table</b> saying which dish is cooked at which station. Only outlets holding the identical book, same name, same edition, same table, can join the city team. An outlet with last year's edition is treated as an outsider, however close it is. That is an <b>MST region</b>.</p>

<h3>The problem MST solves</h3>
<p>Rapid PVST+ runs a full RSTP instance per VLAN. It gives per-VLAN load sharing, but hundreds of VLANs means hundreds of trees, BPDUs and CPU cycles, while the physical network offers only a few useful topologies. <b>MST</b> (IEEE 802.1s, now part of 802.1Q) maps any number of VLANs to a small number of <b>instances</b>. Each instance is one RSTP-style tree; RSTP's proposal/agreement and link types apply unchanged.</p>

<h3>The vocabulary</h3>
<dl class="terms">
<dt>Region</dt><dd>A group of connected switches with the same <b>MST configuration identifier</b>: region <b>name</b> (up to 32 characters, case-sensitive), <b>revision</b> (0-65535) and the <b>VLAN-to-instance mapping</b>. The mapping table (4096 entries) is not sent; a 16-byte <b>digest</b> (HMAC-MD5 of the table) is carried in the BPDU and compared.</dd>
<dt>IST (MST0)</dt><dd>The Internal Spanning Tree, instance 0. It always exists, carries every VLAN you have not mapped elsewhere, and is the only instance that sends BPDUs and carries the timers.</dd>
<dt>MSTI (MST1, MST2 ...)</dt><dd>Additional instances inside the region. Their information travels as small <b>M-records</b> appended to the single IST BPDU. They never leave the region. Instead of message age they use a <b>hop count</b> (<code>spanning-tree mst max-hops</code>, default 20).</dd>
<dt>CST</dt><dd>The Common Spanning Tree that connects regions and non-MST switches, treating each region as one big virtual bridge.</dd>
<dt>CIST</dt><dd>The Common and Internal Spanning Tree: the IST of every region plus the CST. It has one <b>CIST root</b> for the whole network, and each region has a <b>CIST regional root</b> (the region's entry point toward the CIST root).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="MST region with instances">
<rect x="20" y="20" width="420" height="220" rx="12" fill="#e2e8f0"/><text x="230" y="42" text-anchor="middle" class="svg-ink" font-size="13">Region NK-CAMPUS, revision 1, same digest</text>
<rect x="50" y="60" width="110" height="40" rx="8" fill="#bae6fd"/><text x="105" y="85" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="300" y="60" width="110" height="40" rx="8" fill="#bae6fd"/><text x="355" y="85" text-anchor="middle" class="svg-ink" font-size="13">SW2</text>
<rect x="175" y="170" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="230" y="195" text-anchor="middle" class="svg-ink" font-size="13">SW3</text>
<line x1="160" y1="80" x2="300" y2="80" stroke="#64748b" stroke-width="2"/><line x1="115" y1="100" x2="200" y2="170" stroke="#64748b" stroke-width="2"/><line x1="345" y1="100" x2="260" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="105" y="125" text-anchor="middle" class="svg-accent" font-size="12">MST0, MST1 root</text>
<text x="355" y="125" text-anchor="middle" class="svg-accent" font-size="12">MST2 root</text>
<rect x="470" y="60" width="150" height="40" rx="8" fill="#fde68a"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="13">other region / PVST+</text>
<line x1="410" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="545" y="125" text-anchor="middle" class="svg-muted" font-size="12">sees only CIST:</text>
<text x="545" y="142" text-anchor="middle" class="svg-muted" font-size="12">the region = one bridge</text>
</svg><p class="cap">Inside the region every instance has its own tree and root; outside, only the CIST exists.</p></div>

<h3>Priorities and costs per instance</h3>
<p>The bridge ID in an MSTI is <b>priority + instance number</b> (the 12-bit system ID extension now holds the instance, not the VLAN). A switch with priority 24576 shows 24577 in MST1 and 24578 in MST2. Path costs are always the <b>long</b> values: 1G = 20000, 10G = 2000. Cost and port priority can be tuned per instance on an interface: <code>spanning-tree mst 2 cost 5000</code>, <code>spanning-tree mst 2 port-priority 64</code>.</p>

<h3>Building the Lab 1 region</h3>
<p>The campus runs Rapid PVST+ with VLANs 10, 20, 30 and 40. The goal: region NK-CAMPUS, revision 1, VLANs 10,20 in instance 1 and 30,40 in instance 2, identical on SW1, SW2 and SW3.</p>
<pre class="code">SW1(config)# spanning-tree mode mst
SW1(config)# spanning-tree mst configuration
SW1(config-mst)# name NK-CAMPUS
SW1(config-mst)# revision 1
SW1(config-mst)# instance 1 vlan 10,20
SW1(config-mst)# instance 2 vlan 30,40
SW1(config-mst)# show pending
SW1(config-mst)# exit              <span class="c">! the pending copy is committed only now</span>
<span class="c">! repeat exactly on SW2 and SW3</span></pre>
<p>The <code>config-mst</code> sub-mode edits a <b>pending</b> copy. <code>exit</code> or <code>end</code> commits it; <code>abort</code> discards it. <code>show pending</code> is your last chance to catch a typo:</p>
<pre class="out">SW1(config-mst)# show pending
Pending MST configuration
<span class="hl">Name      [NK-CAMPUS]</span>
<span class="hl">Revision  1     Instances configured 3</span>

Instance  Vlans mapped
--------  ---------------------------------------------------------------------
0         1-9,11-19,21-29,31-39,41-4094
1         10,20
2         30,40
-------------------------------------------------------------------------------</pre>
<p>Note that <code>instance 2 vlan 40</code> <b>adds</b> VLAN 40 to whatever instance 2 already holds; <code>no instance 2 vlan 40</code> moves it back to the IST. Mapped VLANs do not even have to exist yet, which is why good designs map future VLAN ranges on day one.</p>

<h3>A different root per instance</h3>
<pre class="code"><span class="c">! SW1: root for MST0 and MST1, backup for MST2</span>
SW1(config)# spanning-tree mst 0-1 root primary
SW1(config)# spanning-tree mst 2 root secondary
<span class="c">! SW2: the mirror image</span>
SW2(config)# spanning-tree mst 2 root primary
SW2(config)# spanning-tree mst 0-1 root secondary</pre>
<p>The macro sets priority 24576 (or lower if needed to beat the current root) for <code>primary</code> and 28672 for <code>secondary</code>. You can also type the value: <code>spanning-tree mst 1 priority 24576</code>. With these roots, SW3 reaches instance 1 via SW1 and instance 2 via SW2: both uplinks carry traffic.</p>

<div class="eg"><p><b>Worked example: which SW3 port blocks in MST1?</b> SW1 is root (24577). SW2 (28673) and SW3 (32769) both reach SW1 over one 1G link: cost 20000 each, so each uses its direct link as root port. On the SW2-SW3 link both ends advertise cost 20000; the tie goes to the lower bridge ID in MST1, SW2 (28673 &lt; 32769). SW2's Gi0/2 is designated, SW3's Gi0/2 is <b>alternate/discarding</b> for MST1. In MST2 SW2 is root and SW1 (28674) beats SW3 (32770) on the SW1-SW3 link, so SW3's Gi0/1 is alternate for MST2. That is exactly the load-sharing pattern Lab 1 checks.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the mapping on one switch at a time during business hours. Every commit changes the digest, so that switch instantly becomes its own region, its links become boundaries and paths shift. Plan the change, apply the identical block everywhere in one window, or pre-map VLANs so the table never needs to change.</p></div>

<div class="exam"><p><b>Exam trap.</b> Three things define a region: name, revision and mapping (digest). Priorities, root placement, max-hops and timers do not. Unmapped VLANs belong to instance 0. The MSTI bridge ID adds the instance number, not the VLAN number.</p></div>

<div class="scn"><h4>The migration that briefly split the campus</h4><p>A university moved a building from Rapid PVST+ to MST. The engineer configured the core first, then each access switch. For ten minutes, users on converted switches saw slow paths and brief drops while unconverted neighbours were PVST+ and converted ones sat on region boundaries. The post-mortem recommended pushing the identical MST block to all switches in the same window, with the roots for all instances inside the core, and verifying with the digest on every switch before closing the change.</p><p><b>Lesson:</b> an MST region is only as good as its most out-of-date switch; roll out the configuration as one unit.</p></div>

<div class="iv"><p class="q">"What are the IST, the MSTI and the CIST?"</p><p>Strong answer: the IST is instance 0 inside a region; it carries all unmapped VLANs and is the only instance that sends BPDUs. MSTIs are additional instances inside the region whose information rides as M-records in that BPDU; they never cross the region boundary. The CIST is the single tree formed by the IST of every region plus the CST between regions and legacy switches; it has one CIST root and one regional root per region. Mention the configuration identifier: name, revision, digest.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MST maps many VLANs to a few instances; each instance is an RSTP tree.</li>
<li>A region = same name (case-sensitive), revision and VLAN-to-instance mapping (compared by digest).</li>
<li>IST = MST0, sends the only BPDU; MSTIs ride as M-records and stay inside the region; CIST spans everything.</li>
<li>config-mst edits a pending copy: <code>show pending</code>, then <code>exit</code> to commit or <code>abort</code>.</li>
<li><code>spanning-tree mst 0-1 root primary</code> / <code>mst 2 root secondary</code> give each instance its own root.</li>
</ul></div>
`,hi:`
<p>Ek franchise restaurants ki chain chahti hai ki shehar ka har outlet ek team ki tarah kaam kare: deliveries share kare, ek doosre ke orders cover kare. Head office ek rule book bhejta hai jisme ek <b>naam</b>, ek <b>edition number</b> aur ek <b>table</b> hota hai jo batata hai kaunsi dish kis station par banegi. Sirf woh outlets city team mein aa sakte hain jinke paas bilkul same book ho: same naam, same edition, same table. Pichhle saal ke edition wala outlet bahar wala maana jaata hai, chahe kitna bhi paas ho. Yahi hai <b>MST region</b>.</p>

<h3>MST kaunsi problem solve karta hai</h3>
<p>Rapid PVST+ har VLAN ke liye poora RSTP instance chalata hai. Isse per-VLAN load sharing milti hai, lekin sainkdon VLANs ka matlab sainkdon trees, BPDUs aur CPU cycles, jabki physical network sirf kuch kaam ki topologies deta hai. <b>MST</b> (IEEE 802.1s, ab 802.1Q ka hissa) kitne bhi VLANs ko chhote number of <b>instances</b> mein map karta hai. Har instance ek RSTP-style tree hai; RSTP ka proposal/agreement aur link types bina badlaav ke lagte hain.</p>

<h3>Vocabulary</h3>
<dl class="terms">
<dt>Region</dt><dd>Jude hue switches ka group jinka <b>MST configuration identifier</b> same hai: region <b>name</b> (32 characters tak, case-sensitive), <b>revision</b> (0-65535) aur <b>VLAN-to-instance mapping</b>. Mapping table (4096 entries) bheji nahi jaati; 16-byte <b>digest</b> (table ka HMAC-MD5) BPDU mein jaata hai aur compare hota hai.</dd>
<dt>IST (MST0)</dt><dd>Internal Spanning Tree, instance 0. Yeh hamesha exist karta hai, har woh VLAN le jaata hai jo aapne kahin aur map nahi kiya, aur yahi akela instance hai jo BPDUs bhejta hai aur timers rakhta hai.</dd>
<dt>MSTI (MST1, MST2 ...)</dt><dd>Region ke andar extra instances. Inki info ek hi IST BPDU ke peeche chhote <b>M-records</b> ki tarah jaati hai. Yeh kabhi region se bahar nahi jaate. Message age ki jagah yeh <b>hop count</b> use karte hain (<code>spanning-tree mst max-hops</code>, default 20).</dd>
<dt>CST</dt><dd>Common Spanning Tree jo regions aur non-MST switches ko jodta hai, har region ko ek bada virtual bridge maan kar.</dd>
<dt>CIST</dt><dd>Common and Internal Spanning Tree: har region ka IST plus CST. Poore network ka ek <b>CIST root</b> hota hai, aur har region ka ek <b>CIST regional root</b> (CIST root ki taraf region ka entry point).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="MST region with instances">
<rect x="20" y="20" width="420" height="220" rx="12" fill="#e2e8f0"/><text x="230" y="42" text-anchor="middle" class="svg-ink" font-size="13">Region NK-CAMPUS, revision 1, same digest</text>
<rect x="50" y="60" width="110" height="40" rx="8" fill="#bae6fd"/><text x="105" y="85" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="300" y="60" width="110" height="40" rx="8" fill="#bae6fd"/><text x="355" y="85" text-anchor="middle" class="svg-ink" font-size="13">SW2</text>
<rect x="175" y="170" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="230" y="195" text-anchor="middle" class="svg-ink" font-size="13">SW3</text>
<line x1="160" y1="80" x2="300" y2="80" stroke="#64748b" stroke-width="2"/><line x1="115" y1="100" x2="200" y2="170" stroke="#64748b" stroke-width="2"/><line x1="345" y1="100" x2="260" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="105" y="125" text-anchor="middle" class="svg-accent" font-size="12">MST0, MST1 root</text>
<text x="355" y="125" text-anchor="middle" class="svg-accent" font-size="12">MST2 root</text>
<rect x="470" y="60" width="150" height="40" rx="8" fill="#fde68a"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="13">doosra region / PVST+</text>
<line x1="410" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="545" y="125" text-anchor="middle" class="svg-muted" font-size="12">sirf CIST dikhta hai:</text>
<text x="545" y="142" text-anchor="middle" class="svg-muted" font-size="12">region = ek bridge</text>
</svg><p class="cap">Region ke andar har instance ka apna tree aur root hai; bahar sirf CIST exist karta hai.</p></div>

<h3>Har instance ki priorities aur costs</h3>
<p>MSTI mein bridge ID = <b>priority + instance number</b> (12-bit system ID extension ab VLAN nahi, instance rakhta hai). Priority 24576 wala switch MST1 mein 24577 aur MST2 mein 24578 dikhata hai. Path costs hamesha <b>long</b> values hoti hain: 1G = 20000, 10G = 2000. Cost aur port priority interface par per instance tune ho sakte hain: <code>spanning-tree mst 2 cost 5000</code>, <code>spanning-tree mst 2 port-priority 64</code>.</p>

<h3>Lab 1 region banana</h3>
<p>Campus VLANs 10, 20, 30 aur 40 ke saath Rapid PVST+ chala raha hai. Goal: region NK-CAMPUS, revision 1, VLANs 10,20 instance 1 mein aur 30,40 instance 2 mein, SW1, SW2 aur SW3 par bilkul same.</p>
<pre class="code">SW1(config)# spanning-tree mode mst
SW1(config)# spanning-tree mst configuration
SW1(config-mst)# name NK-CAMPUS
SW1(config-mst)# revision 1
SW1(config-mst)# instance 1 vlan 10,20
SW1(config-mst)# instance 2 vlan 30,40
SW1(config-mst)# show pending
SW1(config-mst)# exit              <span class="c">! pending copy ab jaake commit hoti hai</span>
<span class="c">! SW2 aur SW3 par bilkul yahi dohrao</span></pre>
<p><code>config-mst</code> sub-mode ek <b>pending</b> copy edit karta hai. <code>exit</code> ya <code>end</code> use commit karta hai; <code>abort</code> use phenk deta hai. <code>show pending</code> typo pakadne ka aakhri mauka hai:</p>
<pre class="out">SW1(config-mst)# show pending
Pending MST configuration
<span class="hl">Name      [NK-CAMPUS]</span>
<span class="hl">Revision  1     Instances configured 3</span>

Instance  Vlans mapped
--------  ---------------------------------------------------------------------
0         1-9,11-19,21-29,31-39,41-4094
1         10,20
2         30,40
-------------------------------------------------------------------------------</pre>
<p>Dhyan do ki <code>instance 2 vlan 40</code> VLAN 40 ko instance 2 mein pehle se jo hai usme <b>jodta</b> hai; <code>no instance 2 vlan 40</code> use wapas IST mein le jaata hai. Mapped VLANs ka abhi exist karna bhi zaroori nahi, isliye achhe designs pehle din hi future VLAN ranges map kar dete hain.</p>

<h3>Har instance ka alag root</h3>
<pre class="code"><span class="c">! SW1: MST0 aur MST1 ka root, MST2 ka backup</span>
SW1(config)# spanning-tree mst 0-1 root primary
SW1(config)# spanning-tree mst 2 root secondary
<span class="c">! SW2: ulti tasveer</span>
SW2(config)# spanning-tree mst 2 root primary
SW2(config)# spanning-tree mst 0-1 root secondary</pre>
<p>Macro <code>primary</code> ke liye priority 24576 (ya current root ko harane ke liye zaroorat ho to kam) aur <code>secondary</code> ke liye 28672 set karta hai. Aap value khud bhi type kar sakte ho: <code>spanning-tree mst 1 priority 24576</code>. In roots ke saath SW3 instance 1 tak SW1 se aur instance 2 tak SW2 se pahunchta hai: dono uplinks traffic le jaate hain.</p>

<div class="eg"><p><b>Worked example: MST1 mein SW3 ka kaunsa port block hota hai?</b> SW1 root hai (24577). SW2 (28673) aur SW3 (32769) dono ek 1G link se SW1 tak pahunchte hain: har ek ki cost 20000, isliye har ek apna direct link root port banata hai. SW2-SW3 link par dono ends cost 20000 advertise karte hain; tie MST1 mein kam bridge ID wale SW2 (28673 &lt; 32769) ke paas jaata hai. SW2 ka Gi0/2 designated hai, SW3 ka Gi0/2 MST1 ke liye <b>alternate/discarding</b>. MST2 mein SW2 root hai aur SW1-SW3 link par SW1 (28674) SW3 (32770) ko harata hai, isliye MST2 ke liye SW3 ka Gi0/1 alternate hai. Lab 1 bilkul yahi load-sharing pattern check karti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Business hours mein ek ek switch par mapping badalna. Har commit digest badalta hai, isliye woh switch turant apna alag region ban jaata hai, uske links boundaries ban jaate hain aur paths shift hote hain. Change plan karo, ek hi window mein har jagah same block apply karo, ya VLANs pehle se map karo taaki table kabhi badalni na pade.</p></div>

<div class="exam"><p><b>Exam trap.</b> Region teen cheezein define karti hain: name, revision aur mapping (digest). Priorities, root placement, max-hops aur timers nahi. Unmapped VLANs instance 0 ke hote hain. MSTI bridge ID instance number jodta hai, VLAN number nahi.</p></div>

<div class="scn"><h4>Migration jisne campus ko thodi der ke liye baant diya</h4><p>Ek university ne ek building ko Rapid PVST+ se MST par move kiya. Engineer ne pehle core configure kiya, phir har access switch. Das minute tak converted switches ke users ko slow paths aur chhote drops dikhe, jab unconverted neighbours PVST+ par the aur converted wale region boundaries par baithe the. Post-mortem ne recommend kiya ki same MST block ek hi window mein saare switches par push karo, saare instances ke roots core ke andar rakho, aur change band karne se pehle har switch par digest se verify karo.</p><p><b>Seekh:</b> MST region utna hi accha hai jitna uska sabse purana switch; configuration ek unit ki tarah roll out karo.</p></div>

<div class="iv"><p class="q">"IST, MSTI aur CIST kya hain?"</p><p>Strong answer: IST region ke andar instance 0 hai; yeh saare unmapped VLANs le jaata hai aur akela instance hai jo BPDUs bhejta hai. MSTIs region ke andar extra instances hain jinki info us BPDU mein M-records ki tarah jaati hai; yeh kabhi region boundary cross nahi karte. CIST woh ek tree hai jo har region ke IST plus regions aur legacy switches ke beech CST se banta hai; iska ek CIST root aur har region ka ek regional root hota hai. Configuration identifier ka zikr karo: name, revision, digest.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MST kai VLANs ko kuch instances mein map karta hai; har instance ek RSTP tree hai.</li>
<li>Region = same name (case-sensitive), revision aur VLAN-to-instance mapping (digest se compare).</li>
<li>IST = MST0, akela BPDU bhejta hai; MSTIs M-records ki tarah jaate hain aur region ke andar rehte hain; CIST sab par faila hai.</li>
<li>config-mst pending copy edit karta hai: <code>show pending</code>, phir commit ke liye <code>exit</code> ya <code>abort</code>.</li>
<li><code>spanning-tree mst 0-1 root primary</code> / <code>mst 2 root secondary</code> har instance ko apna root dete hain.</li>
</ul></div>
`}};export{e as default};