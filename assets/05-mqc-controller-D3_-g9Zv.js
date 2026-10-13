var e={id:`mqc-controller`,h:{en:`MQC on the controller: class-map, policy-map, direction`,hi:`Controller par MQC: class-map, policy-map, direction`},body:{en:`
<p>Metal policies are a fixed menu, like a set lunch. Sometimes you need to order <b>a la carte</b>: "mark only the softphone audio as EF, leave everything else alone". For that you build your own policy with the same <b>MQC</b> (Modular QoS CLI) you met in the ENCOR QoS module: a <b>class-map</b> says <i>which</i> traffic, a <b>policy-map</b> says <i>what to do</i>, and a <b>service-policy</b> attaches it. On the 9800 the attachment point is the <b>policy profile</b>, in one of two directions.</p>
<p>The theory of MQC, classification and marking is in <b>encor-qos</b>. Here we use only what the controller labs need.</p>

<h3>Class-maps: which traffic</h3>
<p>A class-map has a match mode and one or more match statements. <code>match-any</code> means one statement is enough, <code>match-all</code> means every statement must hit. In the lab you can match on DSCP or on an application protocol:</p>
<pre class="code">class-map match-any VOICE-RTP
 description softphone audio
 match protocol rtp-audio
 exit
class-map match-any DSCP-VIDEO
 match dscp af41 af42 af43
 exit</pre>
<ul>
<li><code>match dscp</code> accepts numbers 0 to 63 or names such as <code>ef</code>, <code>af41</code>, <code>cs3</code>, up to eight values per statement.</li>
<li><code>match protocol</code> uses NBAR2 application names. The lab knows rtp, rtp-audio, rtp-video, sip, webex-meeting, skype, ms-teams, dns, ssh, ftp and the web protocols.</li>
<li><code>match access-group</code> is <b>concept only</b>: the lab refuses it. On real hardware an ACL match is another way to classify.</li>
</ul>
<p>An important rule: a protocol class matches only when the <b>AVC flow monitor</b> is enabled on that direction of the policy profile, because NBAR2 does the recognition (chapter 7). A DSCP class needs no monitor.</p>

<h3>Policy-maps: what to do</h3>
<pre class="code">policy-map VOICE-MARK
 class VOICE-RTP
  set dscp ef
  exit
 class class-default
  exit
 exit</pre>
<p>Classes are tested top to bottom; the <b>first</b> match wins and its action is applied. <code>class class-default</code> catches everything left. Inside a class the lab supports <code>set dscp</code> and <code>police</code>. The <code>police</code> line is accepted and shown in the config, but it is <b>concept only</b>: nothing is rate limited in the model, so never use it as evidence that a limit works.</p>

<h3>Attach it: input or output</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Direction of service-policy">
<rect x="20" y="60" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="75" y="93" text-anchor="middle" class="svg-ink" font-size="13">client</text>
<rect x="230" y="40" width="180" height="96" rx="10" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">WLC1 policy profile</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">service-policy input</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">service-policy output</text>
<rect x="510" y="60" width="110" height="56" rx="8" fill="#fed7aa"/><text x="565" y="93" text-anchor="middle" class="svg-ink" font-size="13">wired net</text>
<line x1="130" y1="78" x2="230" y2="78" stroke="#64748b" stroke-width="2"/><line x1="410" y1="78" x2="510" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="180" y="70" text-anchor="middle" class="svg-accent" font-size="12">input</text><text x="460" y="70" text-anchor="middle" class="svg-accent" font-size="12">upstream</text>
<line x1="510" y1="104" x2="410" y2="104" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="230" y1="104" x2="130" y2="104" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="460" y="124" text-anchor="middle" class="svg-muted" font-size="12">enters output</text><text x="180" y="124" text-anchor="middle" class="svg-accent" font-size="12">output = to client</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Input: client to network. Output: network to client.</text>
</svg><p class="cap">Direction is named from the controller's point of view of the wireless client.</p></div>
<pre class="code">wireless profile policy PP-STAFF
 shutdown
 service-policy input VOICE-MARK
 ipv4 flow monitor wireless-avc-basic input
 no shutdown
 exit</pre>
<p><b>Input</b> is the client-to-network direction (what the client sends). <b>Output</b> is network-to-client. A policy attached the wrong way never sees the traffic you meant to mark. The lab refuses a policy-map that does not exist and a policy profile that is not shut. Remove with <code>no service-policy input</code> or <code>no service-policy output</code>.</p>
<p>Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS &gt; QoS policies</b> lists class-maps and policy-maps; <b>Policy profile QoS</b> attaches them.</p>

<h3>Verify</h3>
<pre class="out">WLC1# show class-map VOICE-RTP
 Class Map match-any VOICE-RTP
   Description: softphone audio
   Match protocol rtp-audio

WLC1# show policy-map VOICE-MARK
  Policy Map VOICE-MARK
    Class VOICE-RTP
      <span class="hl">set dscp ef</span>
    Class class-default

WLC1# show wireless client mac-address 0050.7966.6802 service-policy input
Service-policy input of client 0050.7966.6802 (policy profile PP-STAFF)
  Policy Map VOICE-MARK ...
  Per-class counters are concept only in this model.</pre>
<div class="note"><p>The layout of the per-client service-policy output is approximate; real devices show per-class packet counters, which the lab does not simulate.</p></div>

<div class="eg"><p><b>Worked example.</b> A softphone on LAPTOP1 sends RTP audio with DSCP 0. Class VOICE-RTP matches protocol rtp-audio and sets DSCP 46. Attached as <b>input</b> with the AVC input monitor, the controller rewrites 0 to 46 as the packet leaves toward the servers. Attached as <b>output</b> it would only touch traffic coming down from the servers, so nothing changes for the laptop's upload. Also note: marking on the controller does not give the laptop EDCA priority on the air; that happens before the AP.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Attaching a marking policy as output when the problem is upstream.</li>
<li>A <code>match protocol</code> class without the flow monitor on the same direction: the class never matches.</li>
<li>Deleting a class-map that a policy-map still uses (refused), or a policy-map still attached to a profile (refused).</li>
<li>Using <code>police</code> and assuming the rate is enforced.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> first match wins, order matters. Also <code>class-default</code> is built in: you cannot define it as a class-map.</p></div>

<div class="scn"><h4>Softphone marked, but not on the wire</h4><p>The network team wrote a correct policy-map but attached it as output on PP-STAFF. Upload traffic from the softphone still arrived at the servers as DSCP 0. The engineer ran <code>show wireless profile policy detailed PP-STAFF</code>, saw the policy under Output Policy Name, shut the profile, moved it to input, added the AVC input monitor, and the trace showed DSCP 46 upstream.</p><p><b>Lesson:</b> a correct policy in the wrong direction is the same as no policy.</p></div>

<div class="iv"><p class="q">"How do you mark softphone traffic on a 9800?"</p><p>Create a class-map matching the protocol (NBAR2) or DSCP, a policy-map with set dscp ef, attach it as service-policy input on the policy profile of the WLAN, and enable the AVC flow monitor on input. Verify with show policy-map and a trace. Mention that the policy profile must be shut during the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>class-map = which traffic; policy-map = what to do; service-policy = where and which way.</li>
<li>Input is client to network, output is network to client.</li>
<li>First matching class wins; class-default catches the rest.</li>
<li>Protocol classes need the AVC flow monitor on that direction.</li>
<li>police is accepted but concept only; match access-group is refused.</li>
</ul></div>
`,hi:`
<p>Metal policies ek fixed menu hain, jaise set lunch. Kabhi kabhi <b>a la carte</b> order karna padta hai: "sirf softphone audio ko EF mark karo, baaki sab chhodo". Iske liye aap wahi <b>MQC</b> (Modular QoS CLI) use karke apni policy banate ho jo ENCOR QoS module mein dekha tha: <b>class-map</b> batata hai <i>kaunsa</i> traffic, <b>policy-map</b> batata hai <i>kya karna hai</i>, aur <b>service-policy</b> use attach karta hai. 9800 par attach karne ki jagah <b>policy profile</b> hai, do direction mein se ek mein.</p>
<p>MQC, classification aur marking ki theory <b>encor-qos</b> mein hai. Yahan hum sirf wahi use karte hain jo controller labs ko chahiye.</p>

<h3>Class-maps: kaunsa traffic</h3>
<p>Class-map ka ek match mode aur ek ya zyada match statements hote hain. <code>match-any</code> ka matlab ek statement kaafi hai, <code>match-all</code> ka matlab har statement hit honi chahiye. Lab mein aap DSCP ya application protocol par match kar sakte ho:</p>
<pre class="code">class-map match-any VOICE-RTP
 description softphone audio
 match protocol rtp-audio
 exit
class-map match-any DSCP-VIDEO
 match dscp af41 af42 af43
 exit</pre>
<ul>
<li><code>match dscp</code> 0 se 63 ke numbers ya <code>ef</code>, <code>af41</code>, <code>cs3</code> jaise names leta hai, ek statement mein aath values tak.</li>
<li><code>match protocol</code> NBAR2 application names use karta hai. Lab rtp, rtp-audio, rtp-video, sip, webex-meeting, skype, ms-teams, dns, ssh, ftp aur web protocols jaanta hai.</li>
<li><code>match access-group</code> <b>concept only</b> hai: lab use refuse karta hai. Real hardware par ACL match classify karne ka ek aur tareeka hai.</li>
</ul>
<p>Ek zaroori rule: protocol class tabhi match karti hai jab policy profile ki us direction par <b>AVC flow monitor</b> enabled ho, kyunki pehchaan NBAR2 karta hai (chapter 7). DSCP class ko monitor nahi chahiye.</p>

<h3>Policy-maps: kya karna hai</h3>
<pre class="code">policy-map VOICE-MARK
 class VOICE-RTP
  set dscp ef
  exit
 class class-default
  exit
 exit</pre>
<p>Classes upar se neeche test hoti hain; <b>pehli</b> match jeetti hai aur uska action lagta hai. <code>class class-default</code> bacha hua sab pakadti hai. Class ke andar lab <code>set dscp</code> aur <code>police</code> support karta hai. <code>police</code> line accept hoti hai aur config mein dikhti hai, lekin yeh <b>concept only</b> hai: model mein koi rate limit nahi hota, isliye ise kabhi saboot ke taur par mat use karo ki limit kaam karti hai.</p>

<h3>Attach karo: input ya output</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="service-policy ki direction">
<rect x="20" y="60" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="75" y="93" text-anchor="middle" class="svg-ink" font-size="13">client</text>
<rect x="230" y="40" width="180" height="96" rx="10" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">WLC1 policy profile</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">service-policy input</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">service-policy output</text>
<rect x="510" y="60" width="110" height="56" rx="8" fill="#fed7aa"/><text x="565" y="93" text-anchor="middle" class="svg-ink" font-size="13">wired net</text>
<line x1="130" y1="78" x2="230" y2="78" stroke="#64748b" stroke-width="2"/><line x1="410" y1="78" x2="510" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="180" y="70" text-anchor="middle" class="svg-accent" font-size="12">input</text><text x="460" y="70" text-anchor="middle" class="svg-accent" font-size="12">upstream</text>
<line x1="510" y1="104" x2="410" y2="104" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="230" y1="104" x2="130" y2="104" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="460" y="124" text-anchor="middle" class="svg-muted" font-size="12">output mein enter</text><text x="180" y="124" text-anchor="middle" class="svg-accent" font-size="12">output = client ko</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Input: client se network. Output: network se client.</text>
</svg><p class="cap">Direction wireless client ke nazariye se controller par naam di jaati hai.</p></div>
<pre class="code">wireless profile policy PP-STAFF
 shutdown
 service-policy input VOICE-MARK
 ipv4 flow monitor wireless-avc-basic input
 no shutdown
 exit</pre>
<p><b>Input</b> client-se-network direction hai (jo client bhejta hai). <b>Output</b> network-se-client hai. Galat taraf attach hui policy us traffic ko kabhi nahi dekhti jise aap mark karna chahte the. Lab aisi policy-map refuse karta hai jo exist nahi karti aur aisa policy profile jo shut nahi hai. Hatane ke liye <code>no service-policy input</code> ya <code>no service-policy output</code>.</p>
<p>Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS &gt; QoS policies</b> class-maps aur policy-maps list karta hai; <b>Policy profile QoS</b> unhe attach karta hai.</p>

<h3>Verify</h3>
<pre class="out">WLC1# show class-map VOICE-RTP
 Class Map match-any VOICE-RTP
   Description: softphone audio
   Match protocol rtp-audio

WLC1# show policy-map VOICE-MARK
  Policy Map VOICE-MARK
    Class VOICE-RTP
      <span class="hl">set dscp ef</span>
    Class class-default

WLC1# show wireless client mac-address 0050.7966.6802 service-policy input
Service-policy input of client 0050.7966.6802 (policy profile PP-STAFF)
  Policy Map VOICE-MARK ...
  Per-class counters are concept only in this model.</pre>
<div class="note"><p>Per-client service-policy output ka layout approximate hai; real devices per-class packet counters dikhate hain, jo lab simulate nahi karta.</p></div>

<div class="eg"><p><b>Worked example.</b> LAPTOP1 ka softphone DSCP 0 ke saath RTP audio bhejta hai. Class VOICE-RTP protocol rtp-audio match karti hai aur DSCP 46 set karti hai. AVC input monitor ke saath <b>input</b> attach ho to controller servers ki taraf jaate packet par 0 ko 46 kar deta hai. <b>Output</b> attach ho to woh sirf servers se aane wale traffic ko chhoota, isliye laptop ke upload ke liye kuch nahi badalta. Yeh bhi dhyan rakho: controller par marking laptop ko air par EDCA priority nahi deti; woh AP se pehle hota hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Marking policy ko output attach karna jabki problem upstream hai.</li>
<li><code>match protocol</code> class ko same direction ke flow monitor ke bina chhodna: class kabhi match nahi karti.</li>
<li>Aisa class-map delete karna jo policy-map use kar rahi hai (refuse), ya aisi policy-map jo profile par attached hai (refuse).</li>
<li><code>police</code> lagakar maan lena ki rate enforce hoti hai.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> pehli match jeetti hai, order matter karta hai. Aur <code>class-default</code> built in hai: use class-map ke taur par define nahi kar sakte.</p></div>

<div class="scn"><h4>Softphone marked, lekin wire par nahi</h4><p>Network team ne sahi policy-map likhi lekin use PP-STAFF par output attach kiya. Softphone ka upload traffic servers par phir bhi DSCP 0 ke saath pahunchta raha. Engineer ne <code>show wireless profile policy detailed PP-STAFF</code> chalaya, policy ko Output Policy Name mein dekha, profile shut kiya, use input mein move kiya, AVC input monitor joda, aur trace mein upstream DSCP 46 dikha.</p><p><b>Lesson:</b> galat direction mein sahi policy bhi no policy ke barabar hai.</p></div>

<div class="iv"><p class="q">"9800 par softphone traffic ko mark kaise karoge?"</p><p>Protocol (NBAR2) ya DSCP match karne wala class-map banao, set dscp ef wali policy-map banao, use WLAN ke policy profile par service-policy input attach karo, aur input par AVC flow monitor enable karo. show policy-map aur trace se verify karo. Batao ki change ke dauran policy profile shut hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>class-map = kaunsa traffic; policy-map = kya karna hai; service-policy = kahan aur kis taraf.</li>
<li>Input client se network hai, output network se client.</li>
<li>Pehli matching class jeetti hai; class-default baaki pakadti hai.</li>
<li>Protocol classes ko us direction par AVC flow monitor chahiye.</li>
<li>police accept hota hai lekin concept only; match access-group refuse hota hai.</li>
</ul></div>
`}};export{e as default};