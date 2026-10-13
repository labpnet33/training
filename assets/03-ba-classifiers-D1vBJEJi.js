var e={id:`ba-classifiers`,h:{en:`Behaviour aggregate classifiers and the default trap`,hi:`Behaviour aggregate classifiers aur default ka trap`},body:{en:`
<p>A <b>behaviour aggregate (BA) classifier</b> trusts the marking that is already in the packet header and maps each code point to a forwarding class and a loss priority. "Behaviour aggregate" simply means "all packets with the same marking are treated the same way". It is the simplest and most scalable classification method, and it is what you configure on every link between routers that trust each other.</p>

<h3>Anatomy of a classifier</h3>
<p>A classifier has a <b>type</b> (dscp, inet-precedence, ieee-802.1), a <b>name</b>, and one or more lines that say: "these code points go to this forwarding class with this loss priority". Then you bind it to a <b>logical interface</b> (a unit). This is the configuration used on CORE1 in the voice lab:</p>
<pre class="code"><span class="c"># config: trust EF arriving on ge-0/0/0.0</span>
set class-of-service classifiers dscp CL-CORE forwarding-class expedited-forwarding loss-priority low code-points ef
set class-of-service interfaces ge-0/0/0 unit 0 classifiers dscp CL-CORE
commit</pre>
<pre class="out">lab@CORE1&gt; show class-of-service classifier name CL-CORE
Classifier: CL-CORE, Code point type: dscp, Index: 13494
  Code point         Forwarding class                    Loss priority
  <span class="hl">101110             expedited-forwarding                low</span>

lab@CORE1&gt; show class-of-service interface ge-0/0/0
Physical interface: ge-0/0/0, Index: 158
Maximum usable queues: 8, Queues in use: 2
  Scheduler map: &lt;default&gt;, Index: 2
  Congestion-notification: Disabled

  Logical interface: ge-0/0/0.0, Index: 490
    Object                  Name                   Type                    Index
    <span class="hl">Classifier              CL-CORE                dscp                    13494</span></pre>
<p>Notice what the classifier does <b>not</b> say: any code point you did not list goes to the default for that table. A classifier built from scratch contains only your lines, so every other DSCP falls to the default class (best-effort). To start from the built-in table and change only some entries, add <code>import default</code>:</p>
<pre class="code"><span class="c"># config: keep the default dscp table, add AF11 as assured-forwarding low</span>
set class-of-service classifiers dscp CL-X import default
set class-of-service classifiers dscp CL-X forwarding-class assured-forwarding loss-priority low code-points af11
set class-of-service interfaces ge-0/0/1 unit 0 classifiers dscp CL-X</pre>

<h3>The trap: what happens with no classifier</h3>
<p>This is a favourite exam question. If a logical interface has <b>no classifier</b> bound, the router classifies with a built-in table. On the routers in these labs that table is <code>ipprec-compatibility</code>. Look at what EDGE reports before anything is configured:</p>
<pre class="out">lab@EDGE&gt; show class-of-service interface ge-0/0/0
  ...
  Logical interface: ge-0/0/0.0, Index: 490
    Object                  Name                   Type                    Index
    <span class="hl">Classifier              ipprec-compatibility   ip                      13</span></pre>
<pre class="out">lab@EDGE&gt; show class-of-service classifier name ipprec-compatibility
Classifier: ipprec-compatibility, Code point type: inet-precedence, Index: 9
  Code point         Forwarding class                    Loss priority
  000                best-effort                         low
  001                best-effort                         high
  010                best-effort                         low
  ...
  110                network-control                     low
  111                network-control                     high</pre>
<p>Only precedence 6 and 7 map to network-control. <b>Everything else, even DSCP EF, lands in best-effort.</b> That is why a router that "should trust voice" silently ignores the phones' marking until you bind an explicit classifier. Platform note: the default differs between router and switch families, so always read <code>show class-of-service interface</code> to see what is really bound.</p>

<h3>Other BA types and fixed classification</h3>
<ul>
<li><b>ieee-802.1</b> classifiers read the 3 PCP bits of a VLAN tag. They only work on tagged logical interfaces; an untagged access port has no tag to read.</li>
<li><b>inet-precedence</b> classifiers read only the top 3 bits of the ToS byte.</li>
<li><b>Fixed classification</b> puts every packet of a unit into one class, ignoring the header. It is useful for a dedicated link, such as a server backup VLAN:</li>
</ul>
<pre class="code"><span class="c"># config: every packet on ge-0/0/2.0 is assured-forwarding</span>
set class-of-service interfaces ge-0/0/2 unit 0 forwarding-class assured-forwarding</pre>
<pre class="out">lab@EDGE&gt; show class-of-service interface ge-0/0/2
  Logical interface: ge-0/0/2.0, Index: 348
    Object                  Name                   Type                    Index
    <span class="hl">Classifier              assured-forwarding     fixed                   1</span>
    Classifier              dscp-default           dscp                    7</pre>
<p>The fixed entry is listed first and wins. Multifield filters (next chapter) can still override both.</p>

<div class="eg"><p><b>Worked example.</b> Packets with DSCP 46 enter CORE1 on ge-0/0/0.0. Case A: no classifier, so <code>ipprec-compatibility</code> looks at precedence (46 is binary 101110, precedence 101 = 5), which maps to best-effort. Result: queue 0. Case B: CL-CORE is bound; 101110 maps to expedited-forwarding low. Result: queue 1. The same packet, two different queues, only because of one line of configuration.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Writing a classifier but forgetting to bind it under <code>class-of-service interfaces</code>. (2) Binding it to the physical interface instead of the unit. (3) Listing only EF and then wondering why AF traffic lost its marking, because an empty classifier does not inherit defaults without <code>import default</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> "IP phones send DSCP EF to a router with no classifier. Which class do they get?" Best-effort. Never answer expedited-forwarding unless a classifier was configured.</p></div>

<div class="scn"><h4>The router that ignored the phones</h4><p>A new core router was installed between the voice gateway and the branch. Voice was marked EF end to end by the phones, and the WAN scheduler was perfect, but calls still degraded under load. The engineer ran <code>show interfaces queue</code> on the egress port and saw all packets in queue 0 while queue 1 stayed at zero. <code>show class-of-service interface</code> showed <code>ipprec-compatibility</code> on the ingress unit. One <code>set class-of-service interfaces ... classifiers dscp</code> line later the packets appeared in queue 1.</p><p><b>Lesson:</b> a scheduler is useless if the traffic never reaches its queue. Check classification first.</p></div>

<div class="iv"><p class="q">"How do you trust DSCP on a Junos router?"</p><p>I create a dscp BA classifier mapping code points to forwarding classes and loss priorities, often with <code>import default</code> to keep the rest of the table, and I bind it to the ingress logical interface. I verify with <code>show class-of-service interface</code>. I also point out that without it Junos uses the default table where EF goes to best-effort.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A BA classifier maps code points to forwarding class and loss priority.</li>
<li>Bind it to the logical interface (unit), not the physical port.</li>
<li>With no classifier, the default table sends DSCP EF to best-effort.</li>
<li><code>import default</code> keeps the built-in entries you did not list.</li>
<li>802.1p needs tagged interfaces; fixed classification overrides the header.</li>
</ul></div>
`,hi:`
<p><b>Behaviour aggregate (BA) classifier</b> packet header mein pehle se maujood marking par bharosa karta hai aur har code point ko forwarding class aur loss priority par map karta hai. "Behaviour aggregate" ka seedha matlab hai "ek jaisi marking wale saare packets ke saath ek jaisa behaviour". Yeh classification ka sabse simple aur scalable tareeka hai, aur aap ise un har link par lagate ho jo aapas mein trusted routers ke beech hain.</p>

<h3>Classifier ki banawat</h3>
<p>Classifier ka ek <b>type</b> (dscp, inet-precedence, ieee-802.1), ek <b>naam</b>, aur ek ya zyada lines hoti hain jo kehti hain: "yeh code points is forwarding class mein is loss priority ke saath jaayein". Phir use <b>logical interface</b> (unit) par bind karte hain. Voice lab mein CORE1 par yahi configuration use hui:</p>
<pre class="code"><span class="c"># config: ge-0/0/0.0 par aane wale EF par bharosa karo</span>
set class-of-service classifiers dscp CL-CORE forwarding-class expedited-forwarding loss-priority low code-points ef
set class-of-service interfaces ge-0/0/0 unit 0 classifiers dscp CL-CORE
commit</pre>
<pre class="out">lab@CORE1&gt; show class-of-service classifier name CL-CORE
Classifier: CL-CORE, Code point type: dscp, Index: 13494
  Code point         Forwarding class                    Loss priority
  <span class="hl">101110             expedited-forwarding                low</span>

lab@CORE1&gt; show class-of-service interface ge-0/0/0
Physical interface: ge-0/0/0, Index: 158
Maximum usable queues: 8, Queues in use: 2
  Scheduler map: &lt;default&gt;, Index: 2
  Congestion-notification: Disabled

  Logical interface: ge-0/0/0.0, Index: 490
    Object                  Name                   Type                    Index
    <span class="hl">Classifier              CL-CORE                dscp                    13494</span></pre>
<p>Dhyan do classifier kya <b>nahi</b> kehta: jo code point aapne list nahi kiya woh us table ke default mein jaata hai. Scratch se banaye classifier mein sirf aapki lines hoti hain, isliye baaki har DSCP default class (best-effort) mein girta hai. Built-in table se shuru karke sirf kuch entries badalni ho to <code>import default</code> jodo:</p>
<pre class="code"><span class="c"># config: default dscp table rakho, AF11 ko assured-forwarding low karo</span>
set class-of-service classifiers dscp CL-X import default
set class-of-service classifiers dscp CL-X forwarding-class assured-forwarding loss-priority low code-points af11
set class-of-service interfaces ge-0/0/1 unit 0 classifiers dscp CL-X</pre>

<h3>Trap: classifier na ho to kya hota hai</h3>
<p>Yeh exam ka pasandida sawaal hai. Logical interface par <b>koi classifier</b> bind na ho to router built-in table se classify karta hai. In labs ke routers par woh table <code>ipprec-compatibility</code> hai. Kuch configure karne se pehle EDGE kya batata hai dekho:</p>
<pre class="out">lab@EDGE&gt; show class-of-service interface ge-0/0/0
  ...
  Logical interface: ge-0/0/0.0, Index: 490
    Object                  Name                   Type                    Index
    <span class="hl">Classifier              ipprec-compatibility   ip                      13</span></pre>
<pre class="out">lab@EDGE&gt; show class-of-service classifier name ipprec-compatibility
Classifier: ipprec-compatibility, Code point type: inet-precedence, Index: 9
  Code point         Forwarding class                    Loss priority
  000                best-effort                         low
  001                best-effort                         high
  010                best-effort                         low
  ...
  110                network-control                     low
  111                network-control                     high</pre>
<p>Sirf precedence 6 aur 7 network-control mein jaate hain. <b>Baaki sab, DSCP EF bhi, best-effort mein girta hai.</b> Isi liye jo router "voice par bharosa karna chahiye" woh phones ki marking ko chupchaap ignore karta rehta hai jab tak explicit classifier bind na karo. Platform note: router aur switch families ke default alag hote hain, isliye hamesha <code>show class-of-service interface</code> padho ki asal mein kya bind hai.</p>

<h3>Doosre BA types aur fixed classification</h3>
<ul>
<li><b>ieee-802.1</b> classifiers VLAN tag ke 3 PCP bits padhte hain. Yeh sirf tagged logical interfaces par chalte hain; untagged access port mein padhne ko tag hi nahi hota.</li>
<li><b>inet-precedence</b> classifiers ToS byte ke sirf upar ke 3 bits padhte hain.</li>
<li><b>Fixed classification</b> unit ke har packet ko header ignore karke ek hi class mein daal deta hai. Dedicated link, jaise server backup VLAN, ke liye kaam aata hai:</li>
</ul>
<pre class="code"><span class="c"># config: ge-0/0/2.0 ka har packet assured-forwarding hai</span>
set class-of-service interfaces ge-0/0/2 unit 0 forwarding-class assured-forwarding</pre>
<pre class="out">lab@EDGE&gt; show class-of-service interface ge-0/0/2
  Logical interface: ge-0/0/2.0, Index: 348
    Object                  Name                   Type                    Index
    <span class="hl">Classifier              assured-forwarding     fixed                   1</span>
    Classifier              dscp-default           dscp                    7</pre>
<p>Fixed entry pehle listed hai aur jeet-ti hai. Multifield filters (agla chapter) dono ko override kar sakte hain.</p>

<div class="eg"><p><b>Worked example.</b> DSCP 46 wale packets CORE1 ke ge-0/0/0.0 par aate hain. Case A: classifier nahi, to <code>ipprec-compatibility</code> precedence dekhta hai (46 binary 101110 hai, precedence 101 = 5), jo best-effort par map hota hai. Nateeja: queue 0. Case B: CL-CORE bind hai; 101110 expedited-forwarding low par map hota hai. Nateeja: queue 1. Wahi packet, do alag queues, sirf configuration ki ek line ki wajah se.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Classifier likh diya par <code>class-of-service interfaces</code> ke neeche bind karna bhool gaye. (2) Unit ki jagah physical interface par bind kiya. (3) Sirf EF list kiya aur phir sochna ki AF traffic ki marking kyun gayi, kyunki khaali classifier <code>import default</code> ke bina defaults inherit nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> "IP phones DSCP EF bhejte hain aur router par classifier nahi hai. Unhe kaunsi class milti hai?" Best-effort. Jab tak classifier configure na ho, expedited-forwarding kabhi mat kaho.</p></div>

<div class="scn"><h4>Router jisne phones ko ignore kiya</h4><p>Voice gateway aur branch ke beech naya core router lagaya gaya. Phones voice ko end to end EF mark karte the, WAN scheduler perfect tha, phir bhi load mein calls kharab hoti thi. Engineer ne egress port par <code>show interfaces queue</code> chalaya to saare packets queue 0 mein the aur queue 1 zero par. <code>show class-of-service interface</code> ne ingress unit par <code>ipprec-compatibility</code> dikhaya. Ek <code>set class-of-service interfaces ... classifiers dscp</code> line ke baad packets queue 1 mein dikhne lage.</p><p><b>Lesson:</b> traffic apni queue tak pahunche hi na to scheduler bekaar hai. Pehle classification check karo.</p></div>

<div class="iv"><p class="q">"Junos router par DSCP par bharosa kaise karte ho?"</p><p>Main dscp BA classifier banata hoon jo code points ko forwarding classes aur loss priorities par map karta hai, aksar baaki table rakhne ke liye <code>import default</code> ke saath, aur use ingress logical interface par bind karta hoon. <code>show class-of-service interface</code> se verify karta hoon. Yeh bhi batata hoon ki iske bina Junos default table use karta hai jisme EF best-effort mein jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BA classifier code points ko forwarding class aur loss priority par map karta hai.</li>
<li>Use logical interface (unit) par bind karo, physical port par nahi.</li>
<li>Classifier na ho to default table DSCP EF ko best-effort mein bhejti hai.</li>
<li><code>import default</code> aapke na likhe hue built-in entries rakhta hai.</li>
<li>802.1p ko tagged interfaces chahiye; fixed classification header ko override karta hai.</li>
</ul></div>
`}};export{e as default};