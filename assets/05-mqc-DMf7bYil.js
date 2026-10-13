var e={id:`mqc`,h:{en:`MQC: class-map, policy-map, service-policy`,hi:`MQC: class-map, policy-map, service-policy`},body:{en:`
<p>A courier company sorts parcels in three steps. First a sorting rule says what a parcel is: "fragile", "express", "everything else". Then a handling sheet says what to do with each type: "express goes on the first van", "fragile gets bubble wrap". Finally the sheet is pinned to a specific door of the warehouse, for parcels coming in or going out. Cisco's <b>Modular QoS CLI (MQC)</b> is built exactly the same way, and every QoS tool in this module, marking, queuing, WRED, policing and shaping, is configured through it.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="MQC three steps">
<rect x="10" y="40" width="180" height="80" rx="10" fill="#bae6fd"/><text x="100" y="68" text-anchor="middle" class="svg-ink" font-size="14">class-map</text><text x="100" y="90" text-anchor="middle" class="svg-muted" font-size="12">WHAT is the traffic?</text><text x="100" y="108" text-anchor="middle" class="svg-muted" font-size="12">match ...</text>
<rect x="230" y="40" width="180" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="14">policy-map</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">WHAT TO DO per class</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">set, police, priority</text>
<rect x="450" y="40" width="180" height="80" rx="10" fill="#fde68a"/><text x="540" y="68" text-anchor="middle" class="svg-ink" font-size="14">service-policy</text><text x="540" y="90" text-anchor="middle" class="svg-muted" font-size="12">WHERE and which way</text><text x="540" y="108" text-anchor="middle" class="svg-muted" font-size="12">input or output</text>
<line x1="190" y1="80" x2="230" y2="80" stroke="#64748b" stroke-width="2"/><line x1="410" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">classify, then act, then attach</text>
</svg><p class="cap">The three MQC building blocks. A policy does nothing until a service-policy attaches it to an interface.</p></div>

<h3>Step 1: class-map, what the traffic is</h3>
<pre class="code">class-map match-any VOICE
 match access-group name VOICE-RTP
class-map match-all BULK
 match access-group name BULK-SMB</pre>
<ul>
<li><code>match-any</code> is a logical <b>OR</b>: the packet belongs if <b>any</b> match line is true.</li>
<li><code>match-all</code> is a logical <b>AND</b> and is the <b>default</b> if you type only <code>class-map NAME</code>: <b>every</b> line must be true.</li>
<li>Common match criteria: <code>match access-group</code>, <code>match dscp</code>, <code>match precedence</code>, <code>match cos</code>, <code>match protocol</code> (NBAR), <code>match input-interface</code>, <code>match class-map</code> (nesting) and <code>match not</code>.</li>
<li>Class-map names are case-sensitive.</li>
</ul>

<h3>Step 2: policy-map, what to do with each class</h3>
<pre class="code">policy-map MARK-IN
 class VOICE
  set dscp ef
 class BULK
  set dscp af11
  police 3000000 conform-action transmit exceed-action drop
 class class-default
  set dscp default</pre>
<ul>
<li>A packet is compared with the classes <b>top-down</b>; the <b>first match wins</b> and later classes are not checked.</li>
<li><code>class-default</code> always exists and is always evaluated last. It catches everything that matched no other class, even if you do not type it.</li>
<li>A class can hold several actions, as BULK shows: mark and police.</li>
<li>A class can hold a <b>child policy</b> with <code>service-policy CHILD</code>, which builds hierarchical QoS (chapter 9).</li>
</ul>

<h3>Step 3: service-policy, where and in which direction</h3>
<pre class="code">interface GigabitEthernet0/1
 service-policy input MARK-IN
interface GigabitEthernet0/0
 service-policy output WAN-OUT</pre>
<p>One policy per interface per direction. The direction decides what is allowed:</p>
<table class="cmp"><tr><th>Action</th><th>Input</th><th>Output</th></tr>
<tr><td>Classify, <code>set</code> (mark)</td><td>yes</td><td>yes</td></tr>
<tr><td><code>police</code></td><td>yes</td><td>yes</td></tr>
<tr><td><code>priority</code>, <code>bandwidth</code>, <code>fair-queue</code>, <code>random-detect</code></td><td>no</td><td>yes</td></tr>
<tr><td><code>shape</code></td><td>no</td><td>yes</td></tr></table>
<p>Queuing actions exist only in the output direction because a packet can only wait in a queue while it is waiting to be <b>transmitted</b>. IOS rejects a policy with queuing actions applied as input.</p>

<div class="eg"><p><b>Worked example: three packets through MARK-IN.</b> (1) PHONE to HQ-SRV UDP 20000: VOICE matches first, DSCP set to EF, done. (2) PC-DATA to HQ-SRV TCP 445: VOICE does not match, BULK matches, DSCP set to AF11, then the policer checks the 3 Mbps rate. (3) PC-DATA to HQ-SRV UDP 5001: neither VOICE nor BULK matches, so class-default sets DSCP 0. Now imagine someone inserts <code>class ALL-LAN</code> matching <code>10.10.10.0/24</code> <b>above</b> VOICE: every packet would stop there and voice would never be marked EF. Order matters.</p></div>

<h3>Verification</h3>
<pre class="out">R1# show policy-map MARK-IN
  Policy Map MARK-IN
    Class VOICE
      set dscp ef
    Class BULK
      set dscp af11
<span class="hl">      police cir 3000000 bc 93750</span>
        conform-action transmit
        exceed-action drop
    Class class-default
      set dscp default</pre>
<p><code>show class-map</code> shows the match criteria, <code>show policy-map NAME</code> shows the configured actions, and <code>show policy-map interface</code> shows what the policy is actually <b>doing</b>: per-class packet counters, offered rates, marks, policer and queue drops. The last one is the most important command in QoS; chapter 11 reads it line by line.</p>

<div class="warn"><p><b>Common mistake.</b> Creating class-maps and a policy-map and forgetting the <code>service-policy</code> line, or attaching it in the wrong direction. The configuration looks complete in <code>show running-config</code> but nothing happens. This is precisely the fault you will hunt in the troubleshooting lab.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>class-map NAME</code> without a keyword is <b>match-all</b>. A match-all class with <code>match dscp ef</code> and <code>match dscp cs3</code> on two lines can never match, because one packet cannot carry both values. Use match-any, or list both values on one line: <code>match dscp ef cs3</code>, which is an OR within the line.</p></div>

<div class="scn"><h4>The signalling class that never matched</h4><p>An engineer built <code>class-map VOICE-ALL</code> with two lines, <code>match dscp ef</code> and <code>match dscp cs3</code>, to give voice and call signalling the same queue. Calls set up slowly and audio broke under load. <code>show policy-map interface</code> showed 0 packets in VOICE-ALL and everything in class-default. The class-map had been created without a keyword, so it was match-all: a packet had to be both EF and CS3. Recreating it as <code>class-map match-any VOICE-ALL</code> fixed it immediately.</p><p><b>Lesson:</b> always type match-any or match-all explicitly, and check per-class counters after every change.</p></div>

<div class="iv"><p class="q">"Walk me through MQC and explain match-any versus match-all."</p><p>Strong answer: class-maps classify traffic, policy-maps define actions per class evaluated top-down with first match wins and class-default last, and service-policy attaches the policy to an interface in the input or output direction, one per direction. Match-all is AND and is the default; match-any is OR. Queuing actions work only outbound. Verify with show policy-map interface, not only the running configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MQC = class-map (what), policy-map (what to do), service-policy (where and which direction).</li>
<li>match-all (AND) is the default; match-any is OR.</li>
<li>Classes are checked top-down, first match wins; class-default is always last.</li>
<li>Input policies classify, mark and police; queuing and shaping are output only.</li>
<li><code>show policy-map interface</code> proves what a policy is really doing.</li>
</ul></div>
`,hi:`
<p>Ek courier company parcels ko teen steps mein sort karti hai. Pehle ek sorting rule batata hai ki parcel kya hai: "fragile", "express", "baaki sab". Phir ek handling sheet batati hai ki har type ke saath kya karna hai: "express pehli van mein jaayega", "fragile ko bubble wrap milega". Aakhir mein woh sheet warehouse ke ek khaas darwaze par lagayi jaati hai, andar aane ya bahar jaane wale parcels ke liye. Cisco ka <b>Modular QoS CLI (MQC)</b> bilkul isi tarah bana hai, aur is module ka har QoS tool, marking, queuing, WRED, policing aur shaping, isi ke through configure hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="MQC three steps">
<rect x="10" y="40" width="180" height="80" rx="10" fill="#bae6fd"/><text x="100" y="68" text-anchor="middle" class="svg-ink" font-size="14">class-map</text><text x="100" y="90" text-anchor="middle" class="svg-muted" font-size="12">traffic KYA hai?</text><text x="100" y="108" text-anchor="middle" class="svg-muted" font-size="12">match ...</text>
<rect x="230" y="40" width="180" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="14">policy-map</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">har class ke saath KYA KARNA</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">set, police, priority</text>
<rect x="450" y="40" width="180" height="80" rx="10" fill="#fde68a"/><text x="540" y="68" text-anchor="middle" class="svg-ink" font-size="14">service-policy</text><text x="540" y="90" text-anchor="middle" class="svg-muted" font-size="12">KAHAN aur kis taraf</text><text x="540" y="108" text-anchor="middle" class="svg-muted" font-size="12">input ya output</text>
<line x1="190" y1="80" x2="230" y2="80" stroke="#64748b" stroke-width="2"/><line x1="410" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">classify, phir action, phir attach</text>
</svg><p class="cap">MQC ke teen building blocks. Policy tab tak kuch nahi karti jab tak service-policy use interface par attach na kare.</p></div>

<h3>Step 1: class-map, traffic kya hai</h3>
<pre class="code">class-map match-any VOICE
 match access-group name VOICE-RTP
class-map match-all BULK
 match access-group name BULK-SMB</pre>
<ul>
<li><code>match-any</code> logical <b>OR</b> hai: packet tab shaamil hai jab <b>koi bhi</b> match line sach ho.</li>
<li><code>match-all</code> logical <b>AND</b> hai aur <b>default</b> hai agar aap sirf <code>class-map NAME</code> type karo: <b>har</b> line sach honi chahiye.</li>
<li>Common match criteria: <code>match access-group</code>, <code>match dscp</code>, <code>match precedence</code>, <code>match cos</code>, <code>match protocol</code> (NBAR), <code>match input-interface</code>, <code>match class-map</code> (nesting) aur <code>match not</code>.</li>
<li>Class-map names case-sensitive hote hain.</li>
</ul>

<h3>Step 2: policy-map, har class ke saath kya karna hai</h3>
<pre class="code">policy-map MARK-IN
 class VOICE
  set dscp ef
 class BULK
  set dscp af11
  police 3000000 conform-action transmit exceed-action drop
 class class-default
  set dscp default</pre>
<ul>
<li>Packet classes se <b>upar se neeche</b> compare hota hai; <b>pehla match jeet-ta hai</b> aur baad ki classes check nahi hoti.</li>
<li><code>class-default</code> hamesha exist karti hai aur hamesha aakhir mein evaluate hoti hai. Yeh sab kuch pakadti hai jo kisi aur class se match nahi hua, chahe aap ise type na karo.</li>
<li>Ek class mein kai actions ho sakte hain, jaise BULK dikhati hai: mark aur police.</li>
<li>Class <code>service-policy CHILD</code> se ek <b>child policy</b> rakh sakti hai, jo hierarchical QoS banata hai (chapter 9).</li>
</ul>

<h3>Step 3: service-policy, kahan aur kis direction mein</h3>
<pre class="code">interface GigabitEthernet0/1
 service-policy input MARK-IN
interface GigabitEthernet0/0
 service-policy output WAN-OUT</pre>
<p>Har interface par har direction mein ek policy. Direction decide karti hai ki kya allowed hai:</p>
<table class="cmp"><tr><th>Action</th><th>Input</th><th>Output</th></tr>
<tr><td>Classify, <code>set</code> (mark)</td><td>haan</td><td>haan</td></tr>
<tr><td><code>police</code></td><td>haan</td><td>haan</td></tr>
<tr><td><code>priority</code>, <code>bandwidth</code>, <code>fair-queue</code>, <code>random-detect</code></td><td>nahi</td><td>haan</td></tr>
<tr><td><code>shape</code></td><td>nahi</td><td>haan</td></tr></table>
<p>Queuing actions sirf output direction mein hote hain kyunki packet queue mein tabhi intezaar kar sakta hai jab woh <b>transmit</b> hone ka intezaar kar raha ho. IOS input par lagi queuing actions wali policy reject kar deta hai.</p>

<div class="eg"><p><b>Worked example: MARK-IN se teen packets.</b> (1) PHONE se HQ-SRV UDP 20000: VOICE pehle match karti hai, DSCP EF set, khatam. (2) PC-DATA se HQ-SRV TCP 445: VOICE match nahi karti, BULK karti hai, DSCP AF11 set, phir policer 3 Mbps rate check karta hai. (3) PC-DATA se HQ-SRV UDP 5001: na VOICE na BULK match karti hai, isliye class-default DSCP 0 set karti hai. Ab socho koi <code>10.10.10.0/24</code> match karne wali <code>class ALL-LAN</code> VOICE ke <b>upar</b> daal de: har packet wahin ruk jaayega aur voice kabhi EF mark nahi hogi. Order matter karta hai.</p></div>

<h3>Verification</h3>
<pre class="out">R1# show policy-map MARK-IN
  Policy Map MARK-IN
    Class VOICE
      set dscp ef
    Class BULK
      set dscp af11
<span class="hl">      police cir 3000000 bc 93750</span>
        conform-action transmit
        exceed-action drop
    Class class-default
      set dscp default</pre>
<p><code>show class-map</code> match criteria dikhata hai, <code>show policy-map NAME</code> configured actions dikhata hai, aur <code>show policy-map interface</code> dikhata hai ki policy asal mein <b>kya kar rahi hai</b>: har class ke packet counters, offered rates, marks, policer aur queue drops. Aakhri wala QoS ka sabse zaroori command hai; chapter 11 ise line by line padhta hai.</p>

<div class="warn"><p><b>Common galti.</b> Class-maps aur policy-map bana kar <code>service-policy</code> line bhool jaana, ya use galat direction mein attach karna. <code>show running-config</code> mein configuration poori dikhti hai par kuch nahi hota. Yahi woh fault hai jo aap troubleshooting lab mein dhoondhoge.</p></div>

<div class="exam"><p><b>Exam trap.</b> Bina keyword ke <code>class-map NAME</code> <b>match-all</b> hai. Do lines par <code>match dscp ef</code> aur <code>match dscp cs3</code> wali match-all class kabhi match nahi kar sakti, kyunki ek packet dono values nahi le ja sakta. Match-any use karo, ya dono values ek line par likho: <code>match dscp ef cs3</code>, jo line ke andar OR hai.</p></div>

<div class="scn"><h4>Woh signalling class jo kabhi match nahi hui</h4><p>Ek engineer ne voice aur call signalling ko same queue dene ke liye do lines, <code>match dscp ef</code> aur <code>match dscp cs3</code>, ke saath <code>class-map VOICE-ALL</code> banaya. Calls dheere set up hoti thi aur load mein audio toot-ta tha. <code>show policy-map interface</code> mein VOICE-ALL mein 0 packets aur sab class-default mein the. Class-map bina keyword ke bana tha, isliye match-all tha: packet ko EF aur CS3 dono hona tha. Ise <code>class-map match-any VOICE-ALL</code> ke roop mein dobara banane se turant theek ho gaya.</p><p><b>Seekh:</b> hamesha match-any ya match-all saaf type karo, aur har change ke baad per-class counters check karo.</p></div>

<div class="iv"><p class="q">"MQC samjhao aur match-any vs match-all batao."</p><p>Strong answer: class-maps traffic classify karte hain, policy-maps har class ke actions define karte hain jo upar se neeche evaluate hote hain, pehla match jeet-ta hai aur class-default aakhir mein, aur service-policy policy ko interface par input ya output direction mein attach karti hai, har direction mein ek. Match-all AND hai aur default hai; match-any OR hai. Queuing actions sirf outbound kaam karte hain. Sirf running configuration nahi, show policy-map interface se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MQC = class-map (kya), policy-map (kya karna), service-policy (kahan aur kis direction).</li>
<li>match-all (AND) default hai; match-any OR hai.</li>
<li>Classes upar se neeche check hoti hain, pehla match jeet-ta hai; class-default hamesha aakhri.</li>
<li>Input policies classify, mark aur police karti hain; queuing aur shaping sirf output.</li>
<li><code>show policy-map interface</code> sabit karta hai ki policy asal mein kya kar rahi hai.</li>
</ul></div>
`}};export{e as default};