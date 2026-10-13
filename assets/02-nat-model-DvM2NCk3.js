var e={id:`nat-model`,h:{en:`The ASA NAT model: real, mapped, auto NAT and manual NAT`,hi:`ASA NAT model: real, mapped, auto NAT aur manual NAT`},body:{en:`
<p>Every translation on an ASA answers one question: <b>which address does this host really have, and which address should the other side see?</b> The first is the <b>real</b> address, the second is the <b>mapped</b> address. Once you think in real and mapped instead of inside and outside, the whole 8.3+ syntax becomes easy to read.</p>

<h3>Four words you must own</h3>
<dl class="terms">
<dt>Real address</dt><dd>The address actually configured on the host. WEB really is 10.0.2.10.</dd>
<dt>Mapped address</dt><dd>The address the host is translated to on the other interface. WEB is mapped to 203.0.113.3.</dd>
<dt>Real interface</dt><dd>The interface <code>nameif</code> behind which the real address lives: <code>dmz</code> for WEB.</dd>
<dt>Mapped interface</dt><dd>The interface on which the mapped address is used and seen: <code>outside</code>.</dd>
</dl>
<p>The interface pair is always written in that order: <code>nat (real_ifc,mapped_ifc)</code>. So <code>nat (dmz,outside) static 203.0.113.3</code> reads as "the host lives on dmz; on outside it appears as 203.0.113.3". Either interface may be <code>any</code>, for example <code>nat (any,outside)</code>, but specific interfaces are clearer and safer.</p>
<p>Direction words follow the same logic. When a packet goes from the real side to the mapped side, the ASA <b>translates</b> it (real to mapped). When a packet arrives on the mapped side for a mapped address, the ASA <b>untranslates</b> it (mapped back to real). <code>show nat</code> counts these as <code>translate_hits</code> and <code>untranslate_hits</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Real and mapped">
<rect x="20" y="70" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="105" y="94" text-anchor="middle" class="svg-ink" font-size="13">WEB real</text><text x="105" y="114" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10 on dmz</text>
<rect x="245" y="70" width="150" height="60" rx="8" fill="#fed7aa"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">nat (dmz,outside)</text>
<rect x="450" y="70" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="94" text-anchor="middle" class="svg-ink" font-size="13">WEB mapped</text><text x="535" y="114" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.3 on outside</text>
<line x1="190" y1="90" x2="245" y2="90" stroke="#64748b" stroke-width="2"/><line x1="395" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">translate: real to mapped (outbound)</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">untranslate: mapped to real (inbound)</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">first interface = real side, second = mapped side</text>
</svg><p class="cap">Real side on the left, mapped side on the right, exactly the order of the interface pair.</p></div>

<h3>Auto NAT (network object NAT)</h3>
<p>Auto NAT is configured <b>inside a network object</b>. The object defines the real address; the <code>nat</code> line under it defines the mapping. It is the simplest and most common form:</p>
<pre class="code"><span class="c">! Auto NAT: the object is the real host, the nat line is the mapping</span>
object network WEB
 host 10.0.2.10
 nat (dmz,outside) static 203.0.113.3</pre>
<p>Three facts about auto NAT:</p>
<ul>
<li>It translates only the <b>source</b> side of the object. It cannot say "translate differently depending on the destination".</li>
<li>An object can hold <b>one</b> NAT rule. If you need a second translation for the same host, create a second object with the same address, or use manual NAT.</li>
<li>The ASA orders auto NAT rules <b>for you</b> (chapter 3). You never choose their position.</li>
</ul>
<p>In <code>show running-config</code> you will see each auto NAT object twice: once where objects are defined (with <code>host</code> or <code>subnet</code>), and again further down in the NAT section with only the <code>nat</code> line. That is normal display behaviour, not a duplicate.</p>

<h3>Manual NAT (twice NAT)</h3>
<p>Manual NAT is a global <code>nat</code> command that references objects for the real and mapped values. It is called <b>twice NAT</b> because one rule can translate <b>both source and destination</b>, and it can also match on service (ports):</p>
<pre class="code"><span class="c">! Manual NAT: source only, same result as the auto NAT above</span>
object network WEB-REAL
 host 10.0.2.10
object network WEB-PUB
 host 203.0.113.3
nat (dmz,outside) source static WEB-REAL WEB-PUB</pre>
<p>Manual NAT rules sit in the order you configure them, and you can insert one at a line number. They are used for policy NAT, identity NAT for VPN, overlapping networks and anything that depends on the destination. Chapter 7 covers them in depth.</p>

<table class="cmp"><tr><th>Question</th><th>Auto NAT</th><th>Manual NAT</th></tr>
<tr><td>Where configured</td><td>Inside <code>object network</code></td><td>Global <code>nat</code> command</td></tr>
<tr><td>Translates</td><td>Source only</td><td>Source, destination, or both</td></tr>
<tr><td>Can match destination or ports</td><td>No (only its own service for static PAT)</td><td>Yes</td></tr>
<tr><td>Order</td><td>Automatic, section 2</td><td>Your order, section 1 or 3</td></tr>
<tr><td>Typical use</td><td>User PAT, server publishing</td><td>VPN exemption, policy NAT, overlaps</td></tr></table>

<h3>Static versus dynamic: who may start the conversation</h3>
<p>A <b>static</b> rule is permanent and <b>bidirectional</b>: the mapping exists before any traffic, so an outside host can start a connection to the mapped address, and the real host also uses that mapping when it goes out. A <b>dynamic</b> rule (dynamic NAT or dynamic PAT) creates a translation only when a real host <b>sends first</b>; outside hosts cannot start new connections through it. This is why servers get static NAT and users get dynamic PAT.</p>

<h3>xlate and conn: two different tables</h3>
<p>An <b>xlate</b> is a translation slot, shown by <code>show xlate</code>. A <b>conn</b> is a stateful connection, shown by <code>show conn</code>. A static NAT has a permanent xlate even with zero connections; one PAT xlate carries exactly one real IP and port; many conns can use one static xlate.</p>

<div class="eg"><p><b>Worked example.</b> Read <code>nat (inside,outside) dynamic interface</code> under object INSIDE-NET (10.0.1.0/24). Real interface inside, mapped interface outside, type dynamic, mapped address the outside interface (203.0.113.2). PC1 10.0.1.10 opening a web page becomes 203.0.113.2 with some source port; a stranger on the internet cannot open anything toward PC1.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing the pair backwards: <code>nat (outside,dmz) static 203.0.113.3</code> for WEB. The ASA then believes 10.0.2.10 lives on outside and is mapped on dmz. The rule appears in <code>show nat</code> but never gets an untranslate hit from the internet.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Can one network object hold a static NAT and a dynamic PAT?" No, one rule per object. Also remember that auto NAT translates only the source of its object; any question that needs a destination condition points to manual (twice) NAT.</p></div>

<div class="scn"><h4>The second NAT line that silently replaced the first</h4><p>An engineer wanted WEB to keep static NAT and also be covered by a special PAT for backups, so he typed a second <code>nat</code> line under object WEB. The ASA accepted it and replaced the static rule. The website went offline because no untranslate existed any more. The fix was to restore the static line and put the backup PAT in a manual NAT rule.</p><p><b>Lesson:</b> one object, one NAT rule. Extra translations belong in a new object or in manual NAT.</p></div>

<div class="iv"><p class="q">"Explain auto NAT versus twice NAT on the ASA."</p><p>Auto NAT lives inside a network object, translates only that object as a source, allows one rule per object and is ordered automatically. Twice NAT is a global rule that can translate source and destination together and match ports, and it is evaluated in the order you configure. Mention that twice NAT is used for VPN exemption, policy NAT and overlapping networks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read every rule as <code>nat (real_ifc,mapped_ifc)</code>: where the host lives, where it is seen.</li>
<li>Translate = real to mapped; untranslate = mapped to real.</li>
<li>Auto NAT: inside an object, source only, one rule per object, automatic order.</li>
<li>Manual (twice) NAT: global, source and destination, ports, your order.</li>
<li>Static is bidirectional and permanent; dynamic only works for connections the real host starts.</li>
</ul></div>
`,hi:`
<p>ASA par har translation ek sawaal ka jawab deti hai: <b>is host ka asli address kya hai, aur doosri side ko kaunsa address dikhna chahiye?</b> Pehla <b>real</b> address hai, doosra <b>mapped</b> address. Jab aap inside aur outside ki jagah real aur mapped mein sochne lagte ho, to poora 8.3+ syntax padhna aasaan ho jaata hai.</p>

<h3>Chaar shabd jo aapke hone chahiye</h3>
<dl class="terms">
<dt>Real address</dt><dd>Host par actually configured address. WEB asli mein 10.0.2.10 hai.</dd>
<dt>Mapped address</dt><dd>Woh address jismein host doosre interface par translate hota hai. WEB 203.0.113.3 par mapped hai.</dd>
<dt>Real interface</dt><dd>Woh interface <code>nameif</code> jiske peeche real address rehta hai: WEB ke liye <code>dmz</code>.</dd>
<dt>Mapped interface</dt><dd>Woh interface jahan mapped address use hota aur dikhta hai: <code>outside</code>.</dd>
</dl>
<p>Interface pair hamesha isi order mein likha jaata hai: <code>nat (real_ifc,mapped_ifc)</code>. To <code>nat (dmz,outside) static 203.0.113.3</code> aise padho: "host dmz par rehta hai; outside par woh 203.0.113.3 ki tarah dikhta hai". Koi bhi interface <code>any</code> ho sakta hai, jaise <code>nat (any,outside)</code>, lekin specific interfaces zyada clear aur safe hain.</p>
<p>Direction ke shabd bhi isi logic par chalte hain. Jab packet real side se mapped side jaata hai, ASA use <b>translate</b> karta hai (real se mapped). Jab packet mapped side par kisi mapped address ke liye aata hai, ASA use <b>untranslate</b> karta hai (mapped se wapas real). <code>show nat</code> inhe <code>translate_hits</code> aur <code>untranslate_hits</code> ki tarah ginta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Real and mapped">
<rect x="20" y="70" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="105" y="94" text-anchor="middle" class="svg-ink" font-size="13">WEB real</text><text x="105" y="114" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10 dmz par</text>
<rect x="245" y="70" width="150" height="60" rx="8" fill="#fed7aa"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">nat (dmz,outside)</text>
<rect x="450" y="70" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="94" text-anchor="middle" class="svg-ink" font-size="13">WEB mapped</text><text x="535" y="114" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.3 outside par</text>
<line x1="190" y1="90" x2="245" y2="90" stroke="#64748b" stroke-width="2"/><line x1="395" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">translate: real se mapped (outbound)</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">untranslate: mapped se real (inbound)</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">pehla interface = real side, doosra = mapped side</text>
</svg><p class="cap">Real side left mein, mapped side right mein, bilkul interface pair ke order mein.</p></div>

<h3>Auto NAT (network object NAT)</h3>
<p>Auto NAT <b>network object ke andar</b> configure hota hai. Object real address define karta hai; uske neeche ki <code>nat</code> line mapping define karti hai. Yeh sabse simple aur sabse common form hai:</p>
<pre class="code"><span class="c">! Auto NAT: object real host hai, nat line mapping hai</span>
object network WEB
 host 10.0.2.10
 nat (dmz,outside) static 203.0.113.3</pre>
<p>Auto NAT ke baare mein teen facts:</p>
<ul>
<li>Yeh object ki sirf <b>source</b> side translate karta hai. Yeh nahi keh sakta "destination ke hisaab se alag translate karo".</li>
<li>Ek object mein <b>ek</b> NAT rule ho sakti hai. Agar same host ke liye doosra translation chahiye, same address ke saath doosra object banao, ya manual NAT use karo.</li>
<li>ASA auto NAT rules ko <b>aapke liye</b> order karta hai (chapter 3). Aap unki position kabhi choose nahi karte.</li>
</ul>
<p><code>show running-config</code> mein aapko har auto NAT object do baar dikhega: ek baar jahan objects define hote hain (<code>host</code> ya <code>subnet</code> ke saath), aur phir neeche NAT section mein sirf <code>nat</code> line ke saath. Yeh normal display behaviour hai, duplicate nahi.</p>

<h3>Manual NAT (twice NAT)</h3>
<p>Manual NAT ek global <code>nat</code> command hai jo real aur mapped values ke liye objects reference karta hai. Ise <b>twice NAT</b> kehte hain kyunki ek rule <b>source aur destination dono</b> translate kar sakti hai, aur yeh service (ports) par bhi match kar sakti hai:</p>
<pre class="code"><span class="c">! Manual NAT: sirf source, upar wale auto NAT jaisa hi result</span>
object network WEB-REAL
 host 10.0.2.10
object network WEB-PUB
 host 203.0.113.3
nat (dmz,outside) source static WEB-REAL WEB-PUB</pre>
<p>Manual NAT rules usi order mein baithti hain jis mein aap configure karte ho, aur aap ek rule ko line number par insert kar sakte ho. Yeh policy NAT, VPN ke liye identity NAT, overlapping networks aur jo bhi destination par depend kare, uske liye use hoti hain. Chapter 7 inhe depth mein cover karta hai.</p>

<table class="cmp"><tr><th>Sawaal</th><th>Auto NAT</th><th>Manual NAT</th></tr>
<tr><td>Kahan configure hota hai</td><td><code>object network</code> ke andar</td><td>Global <code>nat</code> command</td></tr>
<tr><td>Kya translate karta hai</td><td>Sirf source</td><td>Source, destination, ya dono</td></tr>
<tr><td>Destination ya ports match kar sakta hai</td><td>Nahi (static PAT ke liye sirf apni service)</td><td>Haan</td></tr>
<tr><td>Order</td><td>Automatic, section 2</td><td>Aapka order, section 1 ya 3</td></tr>
<tr><td>Typical use</td><td>User PAT, server publishing</td><td>VPN exemption, policy NAT, overlaps</td></tr></table>

<h3>Static vs dynamic: baat kaun shuru kar sakta hai</h3>
<p><b>Static</b> rule permanent aur <b>bidirectional</b> hai: mapping kisi bhi traffic se pehle exist karti hai, isliye outside host mapped address par connection shuru kar sakta hai, aur real host bahar jaate waqt bhi wahi mapping use karta hai. <b>Dynamic</b> rule (dynamic NAT ya dynamic PAT) translation tabhi banati hai jab real host <b>pehle bhejta hai</b>; outside hosts iske through naye connections shuru nahi kar sakte. Isiliye servers ko static NAT aur users ko dynamic PAT milta hai.</p>

<h3>xlate aur conn: do alag tables</h3>
<p><b>Xlate</b> ek translation slot hai, jo <code>show xlate</code> dikhata hai. <b>Conn</b> ek stateful connection hai, jo <code>show conn</code> dikhata hai. Static NAT ka zero connections par bhi permanent xlate hota hai; ek PAT xlate bilkul ek real IP aur port le jaata hai; bahut saare conns ek static xlate use kar sakte hain.</p>

<div class="eg"><p><b>Worked example.</b> Object INSIDE-NET (10.0.1.0/24) ke neeche <code>nat (inside,outside) dynamic interface</code> padho. Real interface inside, mapped interface outside, type dynamic, mapped address outside interface (203.0.113.2). PC1 10.0.1.10 web page kholta hai to kisi source port ke saath 203.0.113.2 ban jaata hai; internet par koi anjaan PC1 ki taraf kuch nahi khol sakta.</p></div>

<div class="warn"><p><b>Common galti.</b> Pair ulta likhna: WEB ke liye <code>nat (outside,dmz) static 203.0.113.3</code>. Tab ASA maanta hai ki 10.0.2.10 outside par rehta hai aur dmz par mapped hai. Rule <code>show nat</code> mein dikhti hai lekin internet se kabhi untranslate hit nahi milta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kya ek network object mein static NAT aur dynamic PAT dono ho sakte hain?" Nahi, ek object mein ek rule. Yeh bhi yaad rakho ki auto NAT apne object ka sirf source translate karta hai; jis sawaal mein destination condition chahiye, woh manual (twice) NAT ki taraf ishaara karta hai.</p></div>

<div class="scn"><h4>Doosri NAT line jisne chupchaap pehli ko replace kar diya</h4><p>Ek engineer chahta tha ki WEB ka static NAT rahe aur backups ke liye ek special PAT bhi cover kare, to usne object WEB ke neeche doosri <code>nat</code> line type kar di. ASA ne use accept kiya aur static rule replace kar di. Website offline ho gayi kyunki ab koi untranslate exist nahi karta tha. Fix tha static line wapas lagana aur backup PAT ko manual NAT rule mein daalna.</p><p><b>Seekh:</b> ek object, ek NAT rule. Extra translations naye object ya manual NAT mein jaate hain.</p></div>

<div class="iv"><p class="q">"ASA par auto NAT vs twice NAT samjhao."</p><p>Auto NAT network object ke andar rehta hai, sirf us object ko source ki tarah translate karta hai, ek object mein ek rule allow karta hai aur automatically order hota hai. Twice NAT global rule hai jo source aur destination saath translate kar sakta hai aur ports match kar sakta hai, aur aapke configure kiye order mein evaluate hota hai. Batao ki twice NAT VPN exemption, policy NAT aur overlapping networks ke liye use hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har rule ko <code>nat (real_ifc,mapped_ifc)</code> ki tarah padho: host kahan rehta hai, kahan dikhta hai.</li>
<li>Translate = real se mapped; untranslate = mapped se real.</li>
<li>Auto NAT: object ke andar, sirf source, ek object mein ek rule, automatic order.</li>
<li>Manual (twice) NAT: global, source aur destination, ports, aapka order.</li>
<li>Static bidirectional aur permanent hai; dynamic sirf un connections ke liye kaam karta hai jo real host shuru kare.</li>
</ul></div>
`}};export{e as default};