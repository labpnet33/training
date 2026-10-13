var e={id:`format-prefixes`,h:{en:`Hex, shortening rules and prefixes`,hi:`Hex, shortening rules aur prefixes`},body:{en:`
<p>An IPv6 address looks scary the first time: <code>2001:0db8:acad:0010:0000:0000:0000:0001</code>. It is actually just 128 ones and zeros written in a compact way. Think of a long train: 8 coaches (hextets), each coach carrying 16 passengers (bits). Once you know how the coaches are numbered and which empty coaches you may leave out, you can read any address.</p>

<h3>Hexadecimal in two minutes</h3>
<p>Hexadecimal (hex) is base 16. It uses the digits <code>0-9</code> and then <code>a</code>=10, <code>b</code>=11, <code>c</code>=12, <code>d</code>=13, <code>e</code>=14, <code>f</code>=15. One hex digit is exactly <b>4 bits</b> (a <b>nibble</b>): <code>0</code>=0000, <code>8</code>=1000, <code>a</code>=1010, <code>f</code>=1111. Four hex digits are 16 bits, a <b>hextet</b>. Eight hextets are 128 bits. Letters are not case-sensitive: <code>2001:DB8::A</code> and <code>2001:db8::a</code> are the same address, and lower case is the recommended way to write them.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Anatomy of an IPv6 address">
<rect x="10" y="20" width="230" height="40" rx="6" fill="#bae6fd"/><text x="125" y="45" text-anchor="middle" class="svg-ink" font-size="13">2001:0db8:acad</text>
<rect x="245" y="20" width="75" height="40" rx="6" fill="#fde68a"/><text x="282" y="45" text-anchor="middle" class="svg-ink" font-size="13">0010</text>
<rect x="325" y="20" width="305" height="40" rx="6" fill="#bbf7d0"/><text x="477" y="45" text-anchor="middle" class="svg-ink" font-size="13">0000:0000:0000:0001</text>
<text x="125" y="82" text-anchor="middle" class="svg-muted" font-size="12">Global routing prefix: 48 bits</text>
<text x="282" y="82" text-anchor="middle" class="svg-muted" font-size="12">Subnet: 16</text>
<text x="477" y="82" text-anchor="middle" class="svg-muted" font-size="12">Interface ID: 64 bits</text>
<line x1="10" y1="105" x2="320" y2="105" stroke="#64748b"/><text x="165" y="125" text-anchor="middle" class="svg-accent" font-size="13">Prefix /64 (the network)</text>
<line x1="325" y1="105" x2="630" y2="105" stroke="#64748b"/><text x="477" y="125" text-anchor="middle" class="svg-accent" font-size="13">Host part</text>
<text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="13">Short form: 2001:db8:acad:10::1/64</text>
</svg><p class="cap">Eight hextets of 16 bits. On a LAN the first 64 bits name the network, the last 64 bits name the interface.</p></div>

<h3>The two shortening rules</h3>
<ol>
<li><b>Drop leading zeros</b> inside any hextet. <code>0db8</code> becomes <code>db8</code>, <code>0010</code> becomes <code>10</code>, <code>0000</code> becomes <code>0</code>. Only <i>leading</i> zeros: <code>0a00</code> becomes <code>a00</code>, never <code>a</code>.</li>
<li><b>Replace one run</b> of consecutive all-zero hextets with <code>::</code>. You may use <code>::</code> only <b>once</b> per address, because the reader works out how many zero hextets it hides by counting the rest. If there are two runs, shorten the <b>longest</b>; if they tie, shorten the <b>first</b> (leftmost). A single zero hextet should be written as <code>0</code>, not <code>::</code>.</li>
</ol>

<div class="eg"><p><b>Shortening drills.</b> Try each one before reading the answer.</p>
<ul>
<li><code>2001:0db8:acad:0010:0000:0000:0000:0001</code> → leading zeros: <code>2001:db8:acad:10:0:0:0:1</code> → <b><code>2001:db8:acad:10::1</code></b></li>
<li><code>fe80:0000:0000:0000:0250:7fff:fe06:6d01</code> → <b><code>fe80::250:7fff:fe06:6d01</code></b></li>
<li><code>2001:0db8:0000:0000:0a00:0000:0000:0001</code> → two runs of two zeros tie, shorten the first: <b><code>2001:db8::a00:0:0:1</code></b></li>
<li><code>2001:0db8:0000:0001:0000:0000:0000:0000</code> → the trailing run is longer: <b><code>2001:db8:0:1::</code></b></li>
<li><code>0000:0000:0000:0000:0000:0000:0000:0001</code> → <b><code>::1</code></b> (loopback). All zeros → <b><code>::</code></b> (unspecified).</li>
</ul>
<p><b>Expanding</b> works backwards. For <code>2001:db8:a::20</code> count the hextets you see (4), so <code>::</code> hides 8 - 4 = 4 zero hextets: <code>2001:0db8:000a:0000:0000:0000:0000:0020</code>.</p></div>

<h3>Prefixes and prefix length</h3>
<p>IPv6 has no dotted subnet mask. It always uses <b>prefix length</b> notation: <code>2001:db8:acad:10::/64</code> means "the first 64 bits are the network". The prefix is written with the host bits set to zero, just like an IPv4 network address.</p>
<p>A typical allocation chain looks like this:</p>
<table class="cmp"><tr><th>Prefix</th><th>Who gets it</th><th>What it means</th></tr>
<tr><td>/32 (and shorter)</td><td>An Internet provider, from a regional registry</td><td>Room for 65,536 customer /48s</td></tr>
<tr><td>/48</td><td>An organisation or a site</td><td>16 subnet bits: 65,536 LANs</td></tr>
<tr><td>/56</td><td>A home or small branch (common)</td><td>8 subnet bits: 256 LANs</td></tr>
<tr><td>/64</td><td>One LAN or VLAN</td><td>The standard subnet size</td></tr>
<tr><td>/127</td><td>A point-to-point router link (optional)</td><td>Just the two router addresses</td></tr>
<tr><td>/128</td><td>One interface (loopback, host route)</td><td>A single address</td></tr>
</table>

<h3>Why every LAN is a /64</h3>
<p>The /64 is not a waste; it is a design rule. <b>SLAAC</b>, the way hosts build their own addresses (chapter 6), needs a 64-bit interface ID, so it only works on a /64. Privacy addresses, EUI-64 and many security features assume it too. Use /64 on every segment where hosts live, even a link with two devices. Many networks still use /64 on router links for simplicity; /127 is an accepted option for point-to-point links.</p>

<h3>Subnetting IPv6 is counting in hex</h3>
<p>Because the subnet bits usually sit on a hextet boundary, IPv6 subnetting is mostly counting. With <code>2001:db8:acad::/48</code>, the fourth hextet is the subnet ID:</p>
<pre class="code"><span class="c">! Subnet plan for 2001:db8:acad::/48</span>
2001:db8:acad:10::/64    office LAN
2001:db8:acad:12::/64    WAN link R1-R2
2001:db8:acad:20::/64    server LAN
2001:db8:acad:99::/64    tunnel between sites</pre>
<p>Many engineers make the subnet ID match something meaningful, for example the VLAN number (VLAN 10 → <code>:10::</code>, even though hex 10 is decimal 16). Splitting on a nibble boundary (/52, /56, /60) keeps each subnet readable, because every step of 4 bits is exactly one hex digit.</p>

<div class="warn"><p><b>Common mistakes.</b> Using <code>::</code> twice (<code>2001:db8::a00::1</code> is invalid because nobody can tell how many zeros each one hides). Removing trailing zeros (<code>0a00</code> is not <code>a</code>). Using a /112 or /120 on a user LAN and then wondering why SLAAC gives the PCs no address.</p></div>

<div class="exam"><p><b>Exam traps.</b> Questions show four "shortened" forms and only one is valid: check for double <code>::</code> and for dropped trailing zeros first. Remember that each hex digit is 4 bits, so a /56 ends exactly after 14 hex digits, and a /64 after 16 (four full hextets).</p></div>

<div class="scn"><h4>The address that pinged the wrong server</h4><p>A technician typed a firewall rule for the file server <code>2001:db8:acad:20::a00:0:1</code> as <code>2001:db8:acad:20::a:1</code>, thinking the zeros in <code>0a00</code> could all go. The rule matched a different address, and users lost access to the server while an unused address was allowed. The engineer expanded both forms side by side on paper, found the difference in the sixth hextet (<code>0a00</code> versus <code>000a</code>) and corrected the rule.</p><p><b>Lesson:</b> when two addresses look almost the same, expand them to the full 32 hex digits and compare hextet by hextet.</p></div>

<div class="iv"><p class="q">"Shorten 2001:0db8:0000:0000:0001:0000:0000:0000 and explain the rules."</p><p>Strong answer: drop leading zeros to get 2001:db8:0:0:1:0:0:0, then replace one run of zeros with a double colon. There are runs of two and three zero hextets; use it on the longest, so 2001:db8:0:0:1::. Mention that :: may appear only once, ties go to the leftmost run, and trailing zeros inside a hextet are never removed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One hex digit = 4 bits (nibble); one hextet = 16 bits; eight hextets = 128 bits.</li>
<li>Drop leading zeros in each hextet; replace one longest run of zero hextets with <code>::</code>, only once.</li>
<li>IPv6 uses prefix lengths only; a typical site is /48 or /56 and every LAN is a /64.</li>
<li>SLAAC needs a /64; /127 is fine on point-to-point router links.</li>
<li>Subnetting on nibble boundaries turns IPv6 subnetting into simple hex counting.</li>
</ul></div>
`,hi:`
<p>IPv6 address pehli baar dekhne mein darawna lagta hai: <code>2001:0db8:acad:0010:0000:0000:0000:0001</code>. Asal mein yeh sirf 128 ones aur zeros hain jo compact tareeke se likhe gaye hain. Ek lambi train socho: 8 coaches (hextets), har coach mein 16 passengers (bits). Jab aap jaan loge ki coaches ka numbering kaise hota hai aur kaunse khaali coaches chhod sakte ho, to aap koi bhi address padh loge.</p>

<h3>Do minute mein hexadecimal</h3>
<p>Hexadecimal (hex) base 16 hai. Isme digits <code>0-9</code> aur phir <code>a</code>=10, <code>b</code>=11, <code>c</code>=12, <code>d</code>=13, <code>e</code>=14, <code>f</code>=15 hote hain. Ek hex digit bilkul <b>4 bits</b> ka hota hai (ek <b>nibble</b>): <code>0</code>=0000, <code>8</code>=1000, <code>a</code>=1010, <code>f</code>=1111. Chaar hex digits 16 bits hain, ek <b>hextet</b>. Aath hextets 128 bits hain. Letters case-sensitive nahi hain: <code>2001:DB8::A</code> aur <code>2001:db8::a</code> same address hain, aur lower case mein likhna recommended hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="IPv6 address ki anatomy">
<rect x="10" y="20" width="230" height="40" rx="6" fill="#bae6fd"/><text x="125" y="45" text-anchor="middle" class="svg-ink" font-size="13">2001:0db8:acad</text>
<rect x="245" y="20" width="75" height="40" rx="6" fill="#fde68a"/><text x="282" y="45" text-anchor="middle" class="svg-ink" font-size="13">0010</text>
<rect x="325" y="20" width="305" height="40" rx="6" fill="#bbf7d0"/><text x="477" y="45" text-anchor="middle" class="svg-ink" font-size="13">0000:0000:0000:0001</text>
<text x="125" y="82" text-anchor="middle" class="svg-muted" font-size="12">Global routing prefix: 48 bits</text>
<text x="282" y="82" text-anchor="middle" class="svg-muted" font-size="12">Subnet: 16</text>
<text x="477" y="82" text-anchor="middle" class="svg-muted" font-size="12">Interface ID: 64 bits</text>
<line x1="10" y1="105" x2="320" y2="105" stroke="#64748b"/><text x="165" y="125" text-anchor="middle" class="svg-accent" font-size="13">Prefix /64 (network)</text>
<line x1="325" y1="105" x2="630" y2="105" stroke="#64748b"/><text x="477" y="125" text-anchor="middle" class="svg-accent" font-size="13">Host wala hissa</text>
<text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="13">Chhota form: 2001:db8:acad:10::1/64</text>
</svg><p class="cap">16 bits ke aath hextets. LAN par pehle 64 bits network ka naam hain, aakhri 64 bits interface ka.</p></div>

<h3>Chhota karne ke do rules</h3>
<ol>
<li>Har hextet ke andar <b>shuru ke zero hatao</b>. <code>0db8</code> ban jata hai <code>db8</code>, <code>0010</code> ban jata hai <code>10</code>, <code>0000</code> ban jata hai <code>0</code>. Sirf <i>shuru ke</i> zero: <code>0a00</code> banta hai <code>a00</code>, kabhi <code>a</code> nahi.</li>
<li>Lagatar all-zero hextets ke <b>ek run</b> ko <code>::</code> se replace karo. <code>::</code> ek address mein sirf <b>ek baar</b> use kar sakte ho, kyunki padhne wala baaki hextets gin kar pata lagata hai ki yeh kitne zero hextets chhupa raha hai. Agar do runs hain to <b>sabse lamba</b> chhota karo; barabar hon to <b>pehla</b> (sabse left wala). Akela zero hextet <code>0</code> likho, <code>::</code> nahi.</li>
</ol>

<div class="eg"><p><b>Shortening drills.</b> Jawab padhne se pehle har ek khud try karo.</p>
<ul>
<li><code>2001:0db8:acad:0010:0000:0000:0000:0001</code> → leading zeros: <code>2001:db8:acad:10:0:0:0:1</code> → <b><code>2001:db8:acad:10::1</code></b></li>
<li><code>fe80:0000:0000:0000:0250:7fff:fe06:6d01</code> → <b><code>fe80::250:7fff:fe06:6d01</code></b></li>
<li><code>2001:0db8:0000:0000:0a00:0000:0000:0001</code> → do zero ke do runs barabar hain, pehla chhota karo: <b><code>2001:db8::a00:0:0:1</code></b></li>
<li><code>2001:0db8:0000:0001:0000:0000:0000:0000</code> → aakhri run lamba hai: <b><code>2001:db8:0:1::</code></b></li>
<li><code>0000:0000:0000:0000:0000:0000:0000:0001</code> → <b><code>::1</code></b> (loopback). Saare zero → <b><code>::</code></b> (unspecified).</li>
</ul>
<p><b>Expand karna</b> ulta kaam hai. <code>2001:db8:a::20</code> mein jo hextets dikh rahe hain unhe gino (4), to <code>::</code> 8 - 4 = 4 zero hextets chhupa raha hai: <code>2001:0db8:000a:0000:0000:0000:0000:0020</code>.</p></div>

<h3>Prefixes aur prefix length</h3>
<p>IPv6 mein dotted subnet mask nahi hota. Yeh hamesha <b>prefix length</b> notation use karta hai: <code>2001:db8:acad:10::/64</code> ka matlab hai "pehle 64 bits network hain". Prefix host bits ko zero karke likha jata hai, bilkul IPv4 network address ki tarah.</p>
<p>Ek typical allocation chain aisi dikhti hai:</p>
<table class="cmp"><tr><th>Prefix</th><th>Kise milta hai</th><th>Matlab</th></tr>
<tr><td>/32 (aur chhote)</td><td>Internet provider, regional registry se</td><td>65,536 customer /48s ki jagah</td></tr>
<tr><td>/48</td><td>Ek organisation ya site</td><td>16 subnet bits: 65,536 LANs</td></tr>
<tr><td>/56</td><td>Ghar ya chhoti branch (common)</td><td>8 subnet bits: 256 LANs</td></tr>
<tr><td>/64</td><td>Ek LAN ya VLAN</td><td>Standard subnet size</td></tr>
<tr><td>/127</td><td>Point-to-point router link (optional)</td><td>Sirf do router addresses</td></tr>
<tr><td>/128</td><td>Ek interface (loopback, host route)</td><td>Ek single address</td></tr>
</table>

<h3>Har LAN /64 kyun hota hai</h3>
<p>/64 waste nahi hai; yeh design rule hai. <b>SLAAC</b>, jisse hosts apna address khud banate hain (chapter 6), ko 64-bit interface ID chahiye, isliye woh sirf /64 par chalta hai. Privacy addresses, EUI-64 aur kai security features bhi yahi maante hain. Jis segment par hosts hain wahan hamesha /64 lagao, do devices wale link par bhi. Kai networks simplicity ke liye router links par bhi /64 use karte hain; point-to-point links ke liye /127 bhi accepted option hai.</p>

<h3>IPv6 subnetting matlab hex mein ginti</h3>
<p>Kyunki subnet bits aam taur par hextet boundary par hote hain, IPv6 subnetting zyada tar ginti hai. <code>2001:db8:acad::/48</code> mein chautha hextet subnet ID hai:</p>
<pre class="code"><span class="c">! 2001:db8:acad::/48 ka subnet plan</span>
2001:db8:acad:10::/64    office LAN
2001:db8:acad:12::/64    WAN link R1-R2
2001:db8:acad:20::/64    server LAN
2001:db8:acad:99::/64    sites ke beech tunnel</pre>
<p>Kai engineers subnet ID ko kisi meaningful cheez se match karte hain, jaise VLAN number (VLAN 10 → <code>:10::</code>, bhale hi hex 10 decimal mein 16 hai). Nibble boundary (/52, /56, /60) par split karne se har subnet padhne layak rehta hai, kyunki 4 bits ka har step bilkul ek hex digit hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> <code>::</code> do baar use karna (<code>2001:db8::a00::1</code> invalid hai kyunki koi nahi bata sakta ki har ek kitne zero chhupa raha hai). Peechhe ke zero hatana (<code>0a00</code> ka matlab <code>a</code> nahi). User LAN par /112 ya /120 lagana aur phir sochna ki SLAAC PCs ko address kyun nahi de raha.</p></div>

<div class="exam"><p><b>Exam traps.</b> Sawaal chaar "shortened" forms dikhate hain aur sirf ek valid hota hai: pehle double <code>::</code> aur hataye gaye peechhe ke zeros check karo. Yaad rakho ki har hex digit 4 bits hai, isliye /56 bilkul 14 hex digits ke baad khatam hota hai, aur /64 16 ke baad (chaar poore hextets).</p></div>

<div class="scn"><h4>Woh address jisne galat server ko ping kiya</h4><p>Ek technician ne file server <code>2001:db8:acad:20::a00:0:1</code> ka firewall rule <code>2001:db8:acad:20::a:1</code> type kiya, yeh soch kar ki <code>0a00</code> ke saare zero hat sakte hain. Rule ek doosre address se match hua, users ka server access chala gaya aur ek unused address allow ho gaya. Engineer ne dono forms paper par saath saath expand kiye, chhathe hextet mein farak pakda (<code>0a00</code> vs <code>000a</code>) aur rule theek kiya.</p><p><b>Seekh:</b> jab do addresses lagbhag same dikhen, unhe poore 32 hex digits tak expand karo aur hextet by hextet compare karo.</p></div>

<div class="iv"><p class="q">"2001:0db8:0000:0000:0001:0000:0000:0000 ko chhota karo aur rules samjhao."</p><p>Strong answer: leading zeros hatao to 2001:db8:0:0:1:0:0:0 milta hai, phir zeros ke ek run ko double colon se replace karo. Do aur teen zero hextets ke runs hain; sabse lambe par lagao, to 2001:db8:0:0:1::. Batao ki :: sirf ek baar aa sakta hai, tie mein sabse left wala run jeetta hai, aur hextet ke andar peechhe ke zero kabhi nahi hatte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek hex digit = 4 bits (nibble); ek hextet = 16 bits; aath hextets = 128 bits.</li>
<li>Har hextet ke leading zeros hatao; zero hextets ke sabse lambe ek run ko <code>::</code> se replace karo, sirf ek baar.</li>
<li>IPv6 sirf prefix lengths use karta hai; typical site /48 ya /56 hoti hai aur har LAN /64.</li>
<li>SLAAC ko /64 chahiye; point-to-point router links par /127 theek hai.</li>
<li>Nibble boundaries par subnetting IPv6 subnetting ko simple hex ginti bana deta hai.</li>
</ul></div>
`}};export{e as default};