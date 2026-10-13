var e={id:`classification`,h:{en:`Classification with MQC: class-maps and match types`,hi:`MQC se classification: class-maps aur match types`},body:{en:`
<p>On IOS XE all modern QoS is configured with the <b>Modular QoS CLI (MQC)</b>, a three-part pattern you will repeat for the rest of this track: a <b>class-map</b> says which packets, a <b>policy-map</b> says what to do to each class, and a <b>service-policy</b> attaches the policy to an interface. This chapter is the first part, the class-map, which answers one question: <i>does this packet belong to the class?</i></p>

<h3>Anatomy of a class-map</h3>
<pre class="code">class-map [match-any | match-all] NAME
 match &lt;criterion&gt;
 match &lt;criterion&gt;</pre>
<p>A class-map contains one or more <code>match</code> lines. The keyword after <code>class-map</code> sets how the lines combine:</p>
<ul>
<li><b>match-any</b>: logical OR. A packet is in the class if <i>any one</i> line matches.</li>
<li><b>match-all</b>: logical AND. The packet must satisfy <i>every</i> line. This is the <b>default</b> if you type only <code>class-map NAME</code>.</li>
</ul>
<p>With a single match line the two types behave the same. The difference appears with two or more lines, and that is where most classification bugs hide.</p>

<h3>The match criteria you will use</h3>
<table class="cmp"><tr><th>Command</th><th>Matches</th><th>Typical use</th></tr>
<tr><td><code>match access-group name ACL</code></td><td>Packets permitted by an ACL (source, destination, protocol, port)</td><td>Voice RTP port range, a backup server, one subnet</td></tr>
<tr><td><code>match dscp ef af41</code></td><td>Up to eight DSCP values already in the packet</td><td>Trust a marking set by a device you trust</td></tr>
<tr><td><code>match precedence 5</code></td><td>The 3-bit IP precedence</td><td>Older networks</td></tr>
<tr><td><code>match cos 5</code></td><td>802.1p CoS on a tagged frame</td><td>L2 / L3 border (chapter 6)</td></tr>
<tr><td><code>match protocol sip</code></td><td>An application the router recognises (NBAR2 on real IOS XE)</td><td>SIP, HTTP, secure HTTP, DNS</td></tr>
<tr><td><code>match input-interface Gi0/1</code></td><td>Packets that arrived on a given interface</td><td>Treat everything from the guest port alike</td></tr>
<tr><td><code>match class-map OTHER</code></td><td>Whatever another class-map matches (nesting)</td><td>Reuse a definition</td></tr>
<tr><td><code>match not ...</code></td><td>The inverse of any criterion above</td><td>"Anything not already EF"</td></tr>
<tr><td><code>match any</code></td><td>Every packet (this is what class-default does)</td><td>Catch-all</td></tr>
</table>

<div class="note"><p><b>Port based versus application based.</b> On a real router <code>match protocol</code> uses NBAR2 deep inspection, which recognises applications even on odd ports but needs the feature enabled and costs CPU. A <code>match access-group</code> is exact, cheap and predictable, so most production voice classes still use an ACL on the RTP port range. The practice labs in this module simulate <code>match protocol</code> by well-known port numbers.</p></div>

<h3>An ACL inside a class-map only describes membership</h3>
<p>When a class-map points to an ACL, a <code>permit</code> line means "this packet belongs to the class". It does not forward, and a <code>deny</code> line does not block the packet. It only means "this line does not put the packet in this class". Nothing is ever dropped by the ACL, which is why engineers new to QoS find it odd to write <code>permit</code> for backup traffic they want to slow down.</p>

<h3>Building the Pune classes</h3>
<p>The first lab builds four classes on the branch router R1: voice RTP by ACL, SIP signalling and web by protocol, and the SMB backup by ACL.</p>
<pre class="code">ip access-list extended VOICE-RTP
 permit udp any any range 16384 32767
ip access-list extended BACKUP-SMB
 permit tcp any any eq 445
<span class="c">!</span>
class-map match-any VOICE
 match access-group name VOICE-RTP
class-map match-any SIGNALING
 match protocol sip
class-map match-any WEB
 match protocol http
 match protocol secure-http
class-map match-all BACKUP
 match access-group name BACKUP-SMB</pre>
<p>WEB is <b>match-any</b> because a web packet is HTTP <i>or</i> HTTPS, never both. Verify with <code>show class-map</code>:</p>
<pre class="out"> Class Map match-any VOICE (id 1)
   Match access-group name VOICE-RTP
 Class Map match-any SIGNALING (id 2)
   Match protocol sip
 Class Map match-any <span class="hl">WEB (id 3)</span>
   Match protocol http
   Match protocol secure-http
 Class Map match-all BACKUP (id 4)
   Match access-group name BACKUP-SMB
 Class Map match-any class-default (id 0)
   Match any</pre>
<p>Read the type word at the start of each line. If you meant "either" and see <code>match-all</code>, you have found a bug before sending a single packet.</p>

<h3>Order: first match wins</h3>
<p>A policy-map lists its classes top to bottom. A packet is tested against them in that order and <b>the first class that matches takes it</b>. Later classes never see it. Packets that match none fall into the built-in <b>class-default</b>, which always exists at the end.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="First match wins">
<rect x="20" y="70" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<rect x="170" y="14" width="150" height="34" rx="6" fill="#bae6fd"/><text x="245" y="36" text-anchor="middle" class="svg-ink" font-size="13">VOICE ? match</text>
<rect x="170" y="62" width="150" height="34" rx="6" fill="#bae6fd"/><text x="245" y="84" text-anchor="middle" class="svg-ink" font-size="13">SIGNALING ? match</text>
<rect x="170" y="110" width="150" height="34" rx="6" fill="#bae6fd"/><text x="245" y="132" text-anchor="middle" class="svg-ink" font-size="13">WEB ? match</text>
<rect x="170" y="158" width="150" height="34" rx="6" fill="#bae6fd"/><text x="245" y="180" text-anchor="middle" class="svg-ink" font-size="13">BACKUP ? match</text>
<rect x="400" y="86" width="150" height="46" rx="8" fill="#fde68a"/><text x="475" y="114" text-anchor="middle" class="svg-ink" font-size="13">class-default</text>
<line x1="110" y1="95" x2="170" y2="31" stroke="#64748b"/><line x1="110" y1="95" x2="170" y2="79" stroke="#64748b"/><line x1="110" y1="95" x2="170" y2="127" stroke="#64748b"/><line x1="110" y1="95" x2="170" y2="175" stroke="#64748b"/>
<text x="360" y="60" class="svg-muted" font-size="12">first yes wins</text><text x="330" y="190" class="svg-muted" font-size="12">no match anywhere</text><line x1="320" y1="175" x2="400" y2="120" stroke="#64748b"/>
</svg><p class="cap">A packet leaves the list at the first matching class. Only unmatched packets reach class-default.</p></div>
<div class="eg"><p><b>Worked example.</b> How do these packets from Pune classify? A phone sends UDP to port 20000: VOICE (range 16384-32767). A PC opens TCP 80: WEB. A PC copies a file over TCP 445: BACKUP. A PC sends UDP to port 9999: matches no class, so it lands in class-default and keeps DSCP 0.</p></div>

<h3>Using not and nesting</h3>
<pre class="code">class-map match-all NOT-EF
 match not dscp ef
class-map match-any REAL-TIME
 match class-map VOICE
 match dscp af41</pre>
<p>NOT-EF matches every packet that is not already marked EF. REAL-TIME reuses VOICE and adds interactive video marked AF41. Nesting keeps one definition in one place.</p>

<div class="warn"><p><b>Common mistake.</b> Writing a match-all class with two lines that can never be true together, such as <code>match protocol http</code> and <code>match protocol secure-http</code>, or <code>match dscp ef</code> together with an ACL while the traffic arrives unmarked. The class matches nothing, the counters stay at zero and everything lands in class-default.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default type is <b>match-all</b>, not match-any. First match wins. An ACL <code>permit</code> in a class-map is membership, not forwarding. <code>match dscp</code> only helps where the packet already carries the marking you want to match.</p></div>

<div class="scn"><h4>The class that matched nothing</h4><p>A clinic chain in Nashik wanted its doctor video consults in an AF41 class. The engineer wrote <code>class-map match-all DOCTOR-VIDEO</code> with <code>match access-group name VIDEO-ACL</code> and <code>match dscp af41</code> on the branch router's LAN port. Counters stayed at zero. The video app never set a DSCP, so at that point every packet was DSCP 0 and the AND of the two lines could not be true. Removing the <code>match dscp</code> line and marking AF41 with <code>set dscp af41</code> in the policy fixed it.</p><p><b>Lesson:</b> classify on what the packet is, then mark. Only match on DSCP where a trusted device already set it.</p></div>
<div class="iv"><p class="q">"What is the difference between match-any and match-all, and which is the default?"</p><p>Match-any is OR, match-all is AND, and match-all is the default when no keyword is typed. Give an example: a web class needs match-any for HTTP and HTTPS, while a "voice from the Pune subnet" class could use match-all with an ACL and an input interface. Mention that with one match line they are identical.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MQC is class-map (which packets), policy-map (what to do), service-policy (where).</li>
<li>match-any is OR, match-all is AND and is the default.</li>
<li>Common criteria: access-group, dscp, protocol, cos, input-interface, class-map, not.</li>
<li>An ACL in a class-map only means membership; nothing is dropped by it.</li>
<li>Classes are checked top to bottom, first match wins, leftovers go to class-default.</li>
</ul></div>
`,hi:`
<p>IOS XE par saari modern QoS <b>Modular QoS CLI (MQC)</b> se configure hoti hai, ek teen-hisson ka pattern jo aap is track mein baar baar doharaoge: <b>class-map</b> batata hai kaun se packets, <b>policy-map</b> batata hai har class ke saath kya karna hai, aur <b>service-policy</b> policy ko interface par lagati hai. Yeh chapter pehla hissa hai, class-map, jo ek sawal ka jawab deta hai: <i>kya yeh packet is class ka hai?</i></p>

<h3>Class-map ki anatomy</h3>
<pre class="code">class-map [match-any | match-all] NAME
 match &lt;criterion&gt;
 match &lt;criterion&gt;</pre>
<p>Class-map mein ek ya zyada <code>match</code> lines hoti hain. <code>class-map</code> ke baad ka keyword tay karta hai ki lines kaise judti hain:</p>
<ul>
<li><b>match-any</b>: logical OR. Packet class mein tab hai jab <i>koi ek</i> line match kare.</li>
<li><b>match-all</b>: logical AND. Packet ko <i>har</i> line satisfy karni hogi. Agar aap sirf <code>class-map NAME</code> likho to yahi <b>default</b> hai.</li>
</ul>
<p>Ek hi match line ho to dono types ek jaise chalte hain. Farak do ya zyada lines par dikhta hai, aur classification ke zyadatar bugs wahin chhupe hote hain.</p>

<h3>Match criteria jo aap use karoge</h3>
<table class="cmp"><tr><th>Command</th><th>Kya match karta hai</th><th>Aam use</th></tr>
<tr><td><code>match access-group name ACL</code></td><td>ACL se permit hone wale packets (source, destination, protocol, port)</td><td>Voice RTP port range, backup server, ek subnet</td></tr>
<tr><td><code>match dscp ef af41</code></td><td>Packet mein pehle se maujood aath tak DSCP values</td><td>Trusted device ki lagayi marking par bharosa</td></tr>
<tr><td><code>match precedence 5</code></td><td>3-bit IP precedence</td><td>Purane networks</td></tr>
<tr><td><code>match cos 5</code></td><td>Tagged frame par 802.1p CoS</td><td>L2 / L3 border (chapter 6)</td></tr>
<tr><td><code>match protocol sip</code></td><td>Woh application jo router pehchanta hai (real IOS XE par NBAR2)</td><td>SIP, HTTP, secure HTTP, DNS</td></tr>
<tr><td><code>match input-interface Gi0/1</code></td><td>Jo packets kisi interface par aaye</td><td>Guest port ka sab kuch ek jaisa treat karo</td></tr>
<tr><td><code>match class-map OTHER</code></td><td>Jo doosra class-map match karta hai (nesting)</td><td>Ek definition dobara use karo</td></tr>
<tr><td><code>match not ...</code></td><td>Upar ke kisi bhi criterion ka ulta</td><td>"Jo pehle se EF nahi hai"</td></tr>
<tr><td><code>match any</code></td><td>Har packet (class-default yahi karta hai)</td><td>Catch-all</td></tr>
</table>

<div class="note"><p><b>Port based versus application based.</b> Real router par <code>match protocol</code> NBAR2 deep inspection use karta hai, jo ajeeb ports par bhi applications pehchanta hai lekin feature enable chahiye aur CPU lagta hai. <code>match access-group</code> exact, sasta aur predictable hai, isliye production ki zyadatar voice classes ab bhi RTP port range par ACL use karti hain. Is module ke practice labs <code>match protocol</code> ko well-known port numbers se simulate karte hain.</p></div>

<h3>Class-map ke andar ACL sirf membership batati hai</h3>
<p>Jab class-map ACL ko point karta hai, to <code>permit</code> line ka matlab hai "yeh packet is class ka hai". Woh forward nahi karti, aur <code>deny</code> line packet ko block nahi karti. Uska matlab sirf "yeh line packet ko is class mein nahi daalti". ACL se kabhi kuch drop nahi hota, isliye QoS mein naye engineers ko backup traffic ke liye <code>permit</code> likhna ajeeb lagta hai jise woh slow karna chahte hain.</p>

<h3>Pune ki classes banana</h3>
<p>Pehla lab branch router R1 par chaar classes banata hai: voice RTP ACL se, SIP signalling aur web protocol se, aur SMB backup ACL se.</p>
<pre class="code">ip access-list extended VOICE-RTP
 permit udp any any range 16384 32767
ip access-list extended BACKUP-SMB
 permit tcp any any eq 445
<span class="c">!</span>
class-map match-any VOICE
 match access-group name VOICE-RTP
class-map match-any SIGNALING
 match protocol sip
class-map match-any WEB
 match protocol http
 match protocol secure-http
class-map match-all BACKUP
 match access-group name BACKUP-SMB</pre>
<p>WEB <b>match-any</b> hai kyunki web packet HTTP <i>ya</i> HTTPS hota hai, dono kabhi nahi. <code>show class-map</code> se verify karo:</p>
<pre class="out"> Class Map match-any VOICE (id 1)
   Match access-group name VOICE-RTP
 Class Map match-any SIGNALING (id 2)
   Match protocol sip
 Class Map match-any <span class="hl">WEB (id 3)</span>
   Match protocol http
   Match protocol secure-http
 Class Map match-all BACKUP (id 4)
   Match access-group name BACKUP-SMB
 Class Map match-any class-default (id 0)
   Match any</pre>
<p>Har line ke shuru ka type word padho. Agar aap "koi bhi" chahte the aur <code>match-all</code> dikhe, to ek bhi packet bheje bina aapne bug pakad liya.</p>

<h3>Order: pehla match jeetta hai</h3>
<p>Policy-map apni classes upar se neeche list karta hai. Packet ko usi order mein test kiya jaata hai aur <b>jo pehli class match kare woh use le leti hai</b>. Baad ki classes use kabhi dekhti hi nahi. Jo packets kisi se match nahi karte woh built-in <b>class-default</b> mein girte hain, jo hamesha end mein maujood hota hai.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="First match wins">
<rect x="20" y="70" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">Packet</text>
<rect x="170" y="14" width="150" height="34" rx="6" fill="#bae6fd"/><text x="245" y="36" text-anchor="middle" class="svg-ink" font-size="13">VOICE ? match</text>
<rect x="170" y="62" width="150" height="34" rx="6" fill="#bae6fd"/><text x="245" y="84" text-anchor="middle" class="svg-ink" font-size="13">SIGNALING ? match</text>
<rect x="170" y="110" width="150" height="34" rx="6" fill="#bae6fd"/><text x="245" y="132" text-anchor="middle" class="svg-ink" font-size="13">WEB ? match</text>
<rect x="170" y="158" width="150" height="34" rx="6" fill="#bae6fd"/><text x="245" y="180" text-anchor="middle" class="svg-ink" font-size="13">BACKUP ? match</text>
<rect x="400" y="86" width="150" height="46" rx="8" fill="#fde68a"/><text x="475" y="114" text-anchor="middle" class="svg-ink" font-size="13">class-default</text>
<line x1="110" y1="95" x2="170" y2="31" stroke="#64748b"/><line x1="110" y1="95" x2="170" y2="79" stroke="#64748b"/><line x1="110" y1="95" x2="170" y2="127" stroke="#64748b"/><line x1="110" y1="95" x2="170" y2="175" stroke="#64748b"/>
<text x="360" y="60" class="svg-muted" font-size="12">pehla yes jeetta hai</text><text x="330" y="190" class="svg-muted" font-size="12">kahin match nahi</text><line x1="320" y1="175" x2="400" y2="120" stroke="#64748b"/>
</svg><p class="cap">Packet list se pehli matching class par nikal jaata hai. Sirf unmatched packets class-default tak pahunchte hain.</p></div>
<div class="eg"><p><b>Worked example.</b> Pune ke yeh packets kaise classify honge? Phone UDP port 20000 par bheje: VOICE (range 16384-32767). PC TCP 80 khole: WEB. PC TCP 445 par file copy kare: BACKUP. PC UDP port 9999 par bheje: kisi class se match nahi, isliye class-default mein girta hai aur DSCP 0 rehta hai.</p></div>

<h3>not aur nesting ka use</h3>
<pre class="code">class-map match-all NOT-EF
 match not dscp ef
class-map match-any REAL-TIME
 match class-map VOICE
 match dscp af41</pre>
<p>NOT-EF har woh packet match karta hai jo pehle se EF mark nahi hai. REAL-TIME VOICE ko reuse karta hai aur AF41 mark wala interactive video jodta hai. Nesting ek definition ko ek hi jagah rakhti hai.</p>

<div class="warn"><p><b>Common mistake.</b> Aisi match-all class likhna jiski do lines kabhi saath true nahi ho sakti, jaise <code>match protocol http</code> aur <code>match protocol secure-http</code>, ya <code>match dscp ef</code> ACL ke saath jabki traffic unmarked aa raha hai. Class kuch match nahi karti, counters zero rehte hain aur sab class-default mein jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default type <b>match-all</b> hai, match-any nahi. Pehla match jeetta hai. Class-map mein ACL ka <code>permit</code> membership hai, forwarding nahi. <code>match dscp</code> sirf wahan kaam aata hai jahan packet pe woh marking pehle se hai jise aap match karna chahte ho.</p></div>

<div class="scn"><h4>Woh class jo kuch match nahi karti thi</h4><p>Nashik ki ek clinic chain apne doctor video consults ko AF41 class mein chahti thi. Engineer ne branch router ke LAN port par <code>class-map match-all DOCTOR-VIDEO</code> likha jismein <code>match access-group name VIDEO-ACL</code> aur <code>match dscp af41</code> tha. Counters zero rahe. Video app ne kabhi DSCP set nahi kiya, isliye us point par har packet DSCP 0 tha aur dono lines ka AND kabhi true nahi ho sakta tha. <code>match dscp</code> line hatane aur policy mein <code>set dscp af41</code> se mark karne se fix ho gaya.</p><p><b>Lesson:</b> pehle classify karo ki packet kya hai, phir mark karo. DSCP par sirf wahan match karo jahan trusted device ne pehle set kiya ho.</p></div>
<div class="iv"><p class="q">"match-any aur match-all mein kya farak hai, aur default kaunsa hai?"</p><p>Match-any OR hai, match-all AND hai, aur keyword na likho to match-all default hai. Example do: web class ko HTTP aur HTTPS ke liye match-any chahiye, jabki "Pune subnet ki voice" class ACL aur input interface ke saath match-all use kar sakti hai. Bolo ki ek match line ho to dono identical hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MQC hai class-map (kaun se packets), policy-map (kya karna hai), service-policy (kahan).</li>
<li>match-any OR hai, match-all AND hai aur default hai.</li>
<li>Aam criteria: access-group, dscp, protocol, cos, input-interface, class-map, not.</li>
<li>Class-map mein ACL sirf membership batati hai; usse kuch drop nahi hota.</li>
<li>Classes upar se neeche check hoti hain, pehla match jeetta hai, bachi hui class-default mein jaati hain.</li>
</ul></div>
`}};export{e as default};