var e={id:`marking-policy`,h:{en:`Marking with policy-map: set dscp, set cos and service-policy`,hi:`policy-map se marking: set dscp, set cos aur service-policy`},body:{en:`
<p>Classification only decides. A <b>policy-map</b> acts on the decision. For each class it can mark, police, drop or queue. In this chapter we use the marking actions: <code>set dscp</code>, <code>set precedence</code> and <code>set cos</code>. Then we attach the policy to an interface with <code>service-policy</code>, where direction decides everything.</p>

<h3>Anatomy of a policy-map</h3>
<pre class="code">policy-map NAME
 class CLASS-1
  set dscp ef
 class CLASS-2
  set dscp cs3
 class class-default
  <span class="c">! no action: keep whatever arrived</span></pre>
<p>Inside a <code>class</code> block you write actions. The marking actions are:</p>
<table class="cmp"><tr><th>Action</th><th>Writes</th><th>Notes</th></tr>
<tr><td><code>set dscp ef</code></td><td>The 6-bit DSCP in the IP header</td><td>Accepts names or 0 to 63. <code>set ip dscp</code> is the older spelling.</td></tr>
<tr><td><code>set precedence 5</code></td><td>The top 3 bits of the ToS byte</td><td>Legacy; avoid in new designs.</td></tr>
<tr><td><code>set cos 5</code></td><td>The 802.1p CoS in the VLAN tag</td><td>Takes effect only where the frame leaves on a tagged link.</td></tr>
</table>
<p>A class with no action at all is legal and useful: it counts matching packets and leaves their marking alone, which is how we express "trust this class" later.</p>

<h3>Attaching the policy: direction is everything</h3>
<pre class="code">interface GigabitEthernet0/1
 service-policy input MARK-IN</pre>
<p><b>Input</b> means the policy sees a packet as it enters the interface, before routing and before the output interface does anything with it. <b>Output</b> means the policy sees the packet as it leaves. Marking is normally an <b>input</b> job on the LAN side: we classify the traffic where it enters our network and write the DSCP before any later hop makes a queuing decision.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Direction of a service-policy">
<rect x="20" y="50" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">PC, phone</text>
<rect x="230" y="30" width="180" height="100" rx="10" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="14">Router R1</text>
<text x="250" y="90" class="svg-accent" font-size="12">Gi0/1 input: MARK-IN</text><text x="250" y="112" class="svg-accent" font-size="12">Gi0/0 output: WAN-OUT</text>
<rect x="530" y="50" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="575" y="85" text-anchor="middle" class="svg-ink" font-size="13">WAN, HQ</text>
<line x1="110" y1="80" x2="230" y2="80" stroke="#64748b" stroke-width="2"/><line x1="410" y1="80" x2="530" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="170" y="70" text-anchor="middle" class="svg-muted" font-size="11">enters</text><text x="470" y="70" text-anchor="middle" class="svg-muted" font-size="11">leaves</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Mark on the way in, queue on the way out</text>
</svg><p class="cap">The marking written by the input policy is what the output policy classifies on.</p></div>
<table class="cmp"><tr><th>Action</th><th>Input</th><th>Output</th></tr>
<tr><td>set dscp, set cos, set precedence</td><td>Yes (the usual place)</td><td>Yes (for example set cos toward a trunk)</td></tr>
<tr><td>police, drop</td><td>Yes</td><td>Yes</td></tr>
<tr><td>priority, bandwidth, shape, fair-queue</td><td>No, rejected</td><td>Yes (next modules)</td></tr>
</table>
<p>Queuing actions only make sense on output because queues form where packets wait for a busy outgoing link. Try to attach a policy with <code>priority</code> or <code>bandwidth</code> in the input direction and IOS refuses it.</p>

<h3>The complete Pune marking policy</h3>
<pre class="code">policy-map MARK-IN
 class VOICE
  set dscp ef
 class SIGNALING
  set dscp cs3
 class WEB
  set dscp af21
 class BACKUP
  set dscp cs1
<span class="c">!</span>
interface GigabitEthernet0/1
 description Pune LAN
 service-policy input MARK-IN</pre>
<p>Check the policy definition with <code>show policy-map MARK-IN</code>:</p>
<pre class="out">  Policy Map MARK-IN
    Class VOICE
      set dscp ef
    Class SIGNALING
      set dscp cs3
    Class WEB
      set dscp af21
    Class BACKUP
      set dscp cs1</pre>
<p>Then generate traffic from the PCs and read the counters with <code>show policy-map interface GigabitEthernet0/1 input</code>. This is output from the lab after the phone sent a 100 kbps call and 20 kbps of SIP, and PC-DATA sent web, a backup and one unknown UDP flow, each for 10 seconds (the rate lines print zero because the flows had already ended):</p>
<pre class="out"> GigabitEthernet0/1

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)
      <span class="hl">630 packets, 126000 bytes</span>
      Match: access-group name VOICE-RTP
      QoS Set
        dscp ef
          <span class="hl">Packets marked 630</span>

    Class-map: SIGNALING (match-any)
      130 packets, 26000 bytes
      Match: protocol sip
      QoS Set
        dscp cs3
          Packets marked 130
    ...
    Class-map: class-default (match-any)
      <span class="hl">1880 packets, 376000 bytes</span>
      Match: any</pre>
<p>Read it like this. VOICE saw 630 packets (63 per second for 10 seconds) and marked all 630. The class-default block has no QoS Set section, which tells you nothing is being changed there, and its 1880 packets are the unknown flow, left at DSCP 0. If a class shows packets but <i>Packets marked</i> is smaller, something else is dropping or the policy was attached mid-flow.</p>

<h3>Ingress versus egress marking</h3>
<p>Mark on <b>input</b> at the first trusted point. Mark on <b>output</b> only when the value you need depends on the exit interface, the classic case being <code>set cos</code> on the output of a trunk toward the access layer, because CoS belongs to the outgoing 802.1Q tag. Chapter 6 builds exactly that.</p>
<p>One more rule: <b>the output policy sees the DSCP that the input policy wrote</b>. When R1 marks a call EF on Gi0/1 input, the WAN policy on Gi0/0 output can simply <code>match dscp ef</code>. Classification by port number happens once, at the edge. After that, devices read the marking.</p>
<div class="note"><p><b>Looking ahead.</b> A <code>police</code> action can also remark. For example <code>conform-action transmit exceed-action set-dscp-transmit cs1</code> lets traffic above its allowance through, but demoted. The policing module covers it.</p></div>

<div class="warn"><p><b>Common mistake.</b> Attaching the marking policy in the wrong direction. <code>service-policy output</code> on the LAN interface classifies packets heading <i>to</i> the PCs, not the packets the PCs send. All counters read zero and the policy "looks right" in the running-config.</p></div>
<div class="exam"><p><b>Exam trap.</b> Classes are matched in the order written; a class with no set action leaves the marking unchanged; queuing commands are output-only; <code>set cos</code> only matters on a tagged egress; and there is no automatic copy between CoS and DSCP unless you configure one.</p></div>

<div class="scn"><h4>Pune: every counter reads zero</h4><p>Bharat Retail asked a contractor to mark traffic in Pune. The policy looked perfect, yet the WAN priority queue never saw a packet. <code>show policy-map interface Gi0/1</code> began with <i>Service-policy output: MARK-IN</i>. The contractor had attached the policy outbound on the LAN port. Moving it to <code>service-policy input</code> made the counters climb and the call quality returned.</p><p><b>Lesson:</b> always read the very first line of <code>show policy-map interface</code>. It names the direction, and the direction is the most common cause of silent failure.</p></div>
<div class="iv"><p class="q">"Where do you apply a marking policy, and in which direction?"</p><p>As close to the source as possible, in the input direction on the LAN-facing interface, so that later hops, including the WAN output queue, can classify on the marking. Use output marking only for things that depend on the egress link, such as CoS toward a trunk.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A policy-map lists classes in order; each class holds actions such as set dscp, set cos, police.</li>
<li>service-policy input sees the packet as it enters; output as it leaves.</li>
<li>Mark on input near the source; queuing actions exist only on output.</li>
<li>A class without actions counts but does not change the packet.</li>
<li>Read the first line of show policy-map interface to confirm direction, then the Packets marked counters.</li>
</ul></div>
`,hi:`
<p>Classification sirf decide karti hai. <b>Policy-map</b> us decision par action leta hai. Har class ke liye woh mark, police, drop ya queue kar sakta hai. Is chapter mein hum marking actions use karte hain: <code>set dscp</code>, <code>set precedence</code> aur <code>set cos</code>. Phir policy ko <code>service-policy</code> se interface par lagate hain, jahan direction sab kuch tay karti hai.</p>

<h3>Policy-map ki anatomy</h3>
<pre class="code">policy-map NAME
 class CLASS-1
  set dscp ef
 class CLASS-2
  set dscp cs3
 class class-default
  <span class="c">! no action: jo aaya wahi rehne do</span></pre>
<p><code>class</code> block ke andar aap actions likhte ho. Marking actions yeh hain:</p>
<table class="cmp"><tr><th>Action</th><th>Kya likhta hai</th><th>Notes</th></tr>
<tr><td><code>set dscp ef</code></td><td>IP header ka 6-bit DSCP</td><td>Naam ya 0 se 63 leta hai. <code>set ip dscp</code> purani spelling hai.</td></tr>
<tr><td><code>set precedence 5</code></td><td>ToS byte ke top 3 bits</td><td>Legacy; naye designs mein avoid karo.</td></tr>
<tr><td><code>set cos 5</code></td><td>VLAN tag ka 802.1p CoS</td><td>Sirf wahan asar karta hai jahan frame tagged link par nikalta hai.</td></tr>
</table>
<p>Bina kisi action ki class legal bhi hai aur kaam ki bhi: woh matching packets ginti hai aur unki marking ko nahi chhedti, aur aage "is class par trust karo" aise hi express karte hain.</p>

<h3>Policy lagana: direction hi sab kuch hai</h3>
<pre class="code">interface GigabitEthernet0/1
 service-policy input MARK-IN</pre>
<p><b>Input</b> ka matlab policy packet ko interface mein aate hue dekhti hai, routing se pehle aur output interface ke kuch karne se pehle. <b>Output</b> ka matlab policy packet ko jaate hue dekhti hai. Marking aam taur par LAN side ka <b>input</b> kaam hai: hum traffic ko wahan classify karte hain jahan woh humare network mein aata hai aur DSCP tab likh dete hain jab tak koi baad ka hop queuing decision nahi leta.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Direction of a service-policy">
<rect x="20" y="50" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">PC, phone</text>
<rect x="230" y="30" width="180" height="100" rx="10" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="14">Router R1</text>
<text x="250" y="90" class="svg-accent" font-size="12">Gi0/1 input: MARK-IN</text><text x="250" y="112" class="svg-accent" font-size="12">Gi0/0 output: WAN-OUT</text>
<rect x="530" y="50" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="575" y="85" text-anchor="middle" class="svg-ink" font-size="13">WAN, HQ</text>
<line x1="110" y1="80" x2="230" y2="80" stroke="#64748b" stroke-width="2"/><line x1="410" y1="80" x2="530" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="170" y="70" text-anchor="middle" class="svg-muted" font-size="11">enters</text><text x="470" y="70" text-anchor="middle" class="svg-muted" font-size="11">leaves</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Andar aate mark karo, bahar jaate queue karo</text>
</svg><p class="cap">Input policy ki likhi marking par hi output policy classify karti hai.</p></div>
<table class="cmp"><tr><th>Action</th><th>Input</th><th>Output</th></tr>
<tr><td>set dscp, set cos, set precedence</td><td>Haan (aam jagah)</td><td>Haan (jaise trunk ki taraf set cos)</td></tr>
<tr><td>police, drop</td><td>Haan</td><td>Haan</td></tr>
<tr><td>priority, bandwidth, shape, fair-queue</td><td>Nahi, reject hota hai</td><td>Haan (agle modules)</td></tr>
</table>
<p>Queuing actions sirf output par samajh aate hain kyunki queues wahan banti hain jahan packets busy outgoing link ka intezaar karte hain. Input direction mein <code>priority</code> ya <code>bandwidth</code> wali policy lagane ki koshish karo to IOS mana kar deta hai.</p>

<h3>Pune ki poori marking policy</h3>
<pre class="code">policy-map MARK-IN
 class VOICE
  set dscp ef
 class SIGNALING
  set dscp cs3
 class WEB
  set dscp af21
 class BACKUP
  set dscp cs1
<span class="c">!</span>
interface GigabitEthernet0/1
 description Pune LAN
 service-policy input MARK-IN</pre>
<p>Policy definition <code>show policy-map MARK-IN</code> se check karo:</p>
<pre class="out">  Policy Map MARK-IN
    Class VOICE
      set dscp ef
    Class SIGNALING
      set dscp cs3
    Class WEB
      set dscp af21
    Class BACKUP
      set dscp cs1</pre>
<p>Phir PCs se traffic generate karo aur counters <code>show policy-map interface GigabitEthernet0/1 input</code> se padho. Yeh lab ka output hai jab phone ne 100 kbps call aur 20 kbps SIP bheja, aur PC-DATA ne web, ek backup aur ek unknown UDP flow bheja, har ek 10 second ke liye (rate lines zero chhapti hain kyunki flows pehle hi khatam ho chuke the):</p>
<pre class="out"> GigabitEthernet0/1

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)
      <span class="hl">630 packets, 126000 bytes</span>
      Match: access-group name VOICE-RTP
      QoS Set
        dscp ef
          <span class="hl">Packets marked 630</span>

    Class-map: SIGNALING (match-any)
      130 packets, 26000 bytes
      Match: protocol sip
      QoS Set
        dscp cs3
          Packets marked 130
    ...
    Class-map: class-default (match-any)
      <span class="hl">1880 packets, 376000 bytes</span>
      Match: any</pre>
<p>Aise padho. VOICE ne 630 packets dekhe (10 second ke liye 63 per second) aur saare 630 mark kiye. Class-default block mein QoS Set section nahi hai, jo batata hai ki wahan kuch badla nahi ja raha, aur uske 1880 packets woh unknown flow hai jo DSCP 0 par chhoda gaya. Agar kisi class mein packets dikhein par <i>Packets marked</i> kam ho, to kuch aur drop kar raha hai ya policy flow ke beech mein lagayi gayi thi.</p>

<h3>Ingress versus egress marking</h3>
<p><b>Input</b> par pehle trusted point par mark karo. <b>Output</b> par tabhi mark karo jab chahiye hui value exit interface par depend kare, classic case trunk ke output par access layer ki taraf <code>set cos</code> hai, kyunki CoS outgoing 802.1Q tag ka hissa hai. Chapter 6 yahi banata hai.</p>
<p>Ek aur rule: <b>output policy wohi DSCP dekhti hai jo input policy ne likha</b>. Jab R1 Gi0/1 input par call ko EF mark karta hai, to Gi0/0 output ki WAN policy seedha <code>match dscp ef</code> kar sakti hai. Port number se classification edge par ek baar hoti hai. Uske baad devices marking padhte hain.</p>
<div class="note"><p><b>Aage ki baat.</b> <code>police</code> action remark bhi kar sakta hai. Jaise <code>conform-action transmit exceed-action set-dscp-transmit cs1</code> allowance se upar ka traffic guzarne deta hai, lekin demote karke. Policing module ise cover karta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Marking policy ko galat direction mein lagana. LAN interface par <code>service-policy output</code> un packets ko classify karti hai jo PCs <i>ki taraf</i> ja rahe hain, un packets ko nahi jo PCs bhejte hain. Saare counters zero rehte hain aur policy running-config mein "sahi dikhti" hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Classes usi order mein match hoti hain jis order mein likhi hain; jis class mein set action nahi woh marking nahi badalti; queuing commands sirf output ki hain; <code>set cos</code> sirf tagged egress par matter karta hai; aur CoS aur DSCP ke beech koi automatic copy nahi hoti jab tak aap configure na karo.</p></div>

<div class="scn"><h4>Pune: har counter zero</h4><p>Bharat Retail ne contractor se Pune mein traffic mark karne ko kaha. Policy bilkul sahi lagti thi, phir bhi WAN priority queue ne ek packet nahi dekha. <code>show policy-map interface Gi0/1</code> ki shuruaat <i>Service-policy output: MARK-IN</i> se hui. Contractor ne policy LAN port par outbound lagayi thi. Use <code>service-policy input</code> par le jaane se counters badhne lage aur call quality wapas aa gayi.</p><p><b>Lesson:</b> <code>show policy-map interface</code> ki sabse pehli line hamesha padho. Woh direction batati hai, aur direction silent failure ki sabse aam wajah hai.</p></div>
<div class="iv"><p class="q">"Marking policy kahan lagate ho, aur kis direction mein?"</p><p>Source ke jitna paas ho sake, LAN-facing interface par input direction mein, taaki baad ke hops, WAN output queue samet, marking par classify kar sakein. Output marking sirf un cheezon ke liye jo egress link par depend karein, jaise trunk ki taraf CoS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy-map classes ko order mein list karta hai; har class mein set dscp, set cos, police jaise actions hote hain.</li>
<li>service-policy input packet ko aate hue dekhti hai; output jaate hue.</li>
<li>Input par source ke paas mark karo; queuing actions sirf output par hain.</li>
<li>Bina actions ki class ginti hai par packet nahi badalti.</li>
<li>Direction confirm karne ke liye show policy-map interface ki pehli line padho, phir Packets marked counters.</li>
</ul></div>
`}};export{e as default};