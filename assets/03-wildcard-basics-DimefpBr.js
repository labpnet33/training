var e={id:`wildcard-basics`,h:{en:`Wildcard masks: the basics`,hi:`Wildcard masks: basics`},body:{en:`
<p>Think of a stencil used to paint a signboard. Where the stencil is solid, paint cannot pass; where it is cut out, anything goes through. A <b>wildcard mask</b> is a stencil laid over a 32-bit IPv4 address. Where the mask has a <b>0</b>, the packet's bit <b>must equal</b> the bit in the ACL entry. Where the mask has a <b>1</b>, the router <b>does not care</b> what the bit is. That is the whole idea; everything else is practice.</p>

<h3>Why not just use a subnet mask?</h3>
<p>A subnet mask describes a network: a block of 1s followed by a block of 0s. ACLs need something more flexible. They must be able to say "this exact host", "this whole subnet", "any address at all" and even odd things like "every odd-numbered host". So Cisco uses a separate mask with the opposite meaning. For a normal subnet, the wildcard is simply the <b>inverse</b> of the subnet mask: every 1 becomes 0 and every 0 becomes 1.</p>

<dl class="terms">
<dt>0 bit in the wildcard</dt><dd>"Check this bit." The packet's bit must match the ACL address bit.</dd>
<dt>1 bit in the wildcard</dt><dd>"Ignore this bit." Any value is accepted.</dd>
<dt>host A.B.C.D</dt><dd>Shorthand for <code>A.B.C.D 0.0.0.0</code>: check all 32 bits, so exactly one address.</dd>
<dt>any</dt><dd>Shorthand for <code>0.0.0.0 255.255.255.255</code>: ignore all 32 bits, so every address.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Wildcard bit comparison">
<text x="20" y="40" class="svg-ink" font-size="13">ACL address</text><text x="200" y="40" class="svg-ink" font-size="13">192 . 168 . 10 .</text><rect x="360" y="24" width="200" height="24" rx="4" fill="#e2e8f0"/><text x="460" y="41" text-anchor="middle" class="svg-ink" font-size="13">0000 0000</text>
<text x="20" y="85" class="svg-ink" font-size="13">Wildcard</text><rect x="196" y="69" width="160" height="24" rx="4" fill="#bbf7d0"/><text x="276" y="86" text-anchor="middle" class="svg-ink" font-size="13">0 . 0 . 0 .</text><rect x="360" y="69" width="200" height="24" rx="4" fill="#fde68a"/><text x="460" y="86" text-anchor="middle" class="svg-ink" font-size="13">1111 1111</text>
<text x="276" y="115" text-anchor="middle" class="svg-accent" font-size="12">must match</text><text x="460" y="115" text-anchor="middle" class="svg-accent" font-size="12">don't care</text>
<text x="20" y="160" class="svg-ink" font-size="13">Packet 192.168.10.77</text><text x="276" y="160" text-anchor="middle" class="svg-ink" font-size="13">192.168.10 = OK</text><text x="460" y="160" text-anchor="middle" class="svg-muted" font-size="13">77 ignored</text>
<text x="20" y="200" class="svg-ink" font-size="13">Packet 192.168.11.5</text><text x="276" y="200" text-anchor="middle" class="svg-ink" font-size="13">11 is not 10 = NO</text><text x="460" y="200" text-anchor="middle" class="svg-muted" font-size="13">not checked</text>
</svg><p class="cap">192.168.10.0 0.0.0.255: the first three octets are checked, the last octet is free. Result: 192.168.10.0 to 192.168.10.255.</p></div>

<h3>The quick method: 255 minus the mask</h3>
<p>For any normal subnet, subtract each octet of the subnet mask from 255. The result is the wildcard.</p>
<table class="cmp">
<tr><th>Prefix</th><th>Subnet mask</th><th>Wildcard</th><th>Block size</th></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>0.0.0.0 (host)</td><td>1</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>0.0.0.3</td><td>4</td></tr>
<tr><td>/29</td><td>255.255.255.248</td><td>0.0.0.7</td><td>8</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>0.0.0.31</td><td>32</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>0.0.0.63</td><td>64</td></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>0.0.0.255</td><td>256</td></tr>
<tr><td>/20</td><td>255.255.240.0</td><td>0.0.15.255</td><td>4096</td></tr>
<tr><td>/16</td><td>255.255.0.0</td><td>0.0.255.255</td><td>65 536</td></tr>
<tr><td>/0</td><td>0.0.0.0</td><td>255.255.255.255 (any)</td><td>all</td></tr>
</table>
<p>Notice the pattern: in the interesting octet the wildcard is always <b>block size minus 1</b> (3, 7, 31, 63, 255, 15). If you know the block size from subnetting, you know the wildcard.</p>

<h3>How the router really tests a match</h3>
<p>The router looks only at the bits where the wildcard is 0. For those bits, packet and ACL address must be identical. A handy mental shortcut for a normal subnet wildcard: the entry matches every address from the <b>ACL address</b> up to <b>ACL address plus wildcard</b>. For <code>10.1.32.0 0.0.3.255</code> that is 10.1.32.0 up to 10.1.35.255.</p>

<div class="eg"><p><b>Worked example.</b> Match the /27 subnet 172.16.5.96 with mask 255.255.255.224. Wildcard: 255 minus 224 is 31, so <code>172.16.5.96 0.0.0.31</code>. Range: 172.16.5.96 to 172.16.5.127 (96 + 31). Does 172.16.5.130 match? 130 is beyond 127, so no. Does 172.16.5.100 match? Yes. In binary, 96 is 011 00000 and 100 is 011 00100: the top three bits (checked) are equal, and the last five (ignored) differ, which is fine.</p></div>

<h3>IOS tidies up your address bits</h3>
<p>If you type an address that has 1s in the "don't care" positions, IOS quietly zeroes them. Type <code>access-list 10 permit 10.1.1.77 0.0.0.255</code> and the running config shows <code>10.1.1.0, wildcard bits 0.0.0.255</code>. This is harmless here, but it is a clue: if the config shows a network you did not intend, your wildcard was wider than you thought.</p>
<pre class="code"><span class="c">! Three ways to match one host in a standard ACL</span>
R1(config)# access-list 5 permit host 10.1.1.5
R1(config)# access-list 5 permit 10.1.1.5 0.0.0.0
R1(config)# access-list 5 permit 10.1.1.5
<span class="c">! In a standard ACL a missing wildcard means 0.0.0.0 (host)</span></pre>
<pre class="out">R1# show access-lists 5
Standard IP access list 5
    <span class="hl">10 permit 10.1.1.5</span></pre>
<p>All three lines mean the same thing; IOS stores it once and shows the host without a wildcard. In an <b>extended</b> ACL you cannot leave the wildcard off: use <code>host</code> or write <code>0.0.0.0</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Typing the subnet mask instead of the wildcard: <code>access-list 10 deny 10.1.20.0 255.255.255.0</code>. IOS accepts it, because it is a legal wildcard, but it now ignores the first three octets and checks only the last one. It matches every address in the world that ends in .0, and the guest subnet is not blocked at all. Always sanity-check: a wildcard for a subnet starts with 0s, not 255s.</p></div>

<div class="exam"><p><b>Exam trap.</b> The exam may show <code>0.0.0.0 255.255.255.255</code> and <code>any</code> as separate answers; they are identical. Likewise <code>host 10.1.1.1</code> equals <code>10.1.1.1 0.0.0.0</code>. And a wildcard of 0.0.0.255 means /24, not /8.</p></div>

<div class="scn"><h4>The deny that blocked the whole company</h4><p>A junior engineer was told to stop the guest subnet 10.1.20.0/24 reaching a server. He wrote <code>access-list 12 deny 10.1.20.0 255.255.255.0</code> followed by <code>access-list 12 permit any</code>. Guests could still reach the server, and the helpdesk later found hosts ending in .0 being blocked in odd places. The senior engineer read <code>show access-lists 12</code>, saw <code>deny 0.0.0.0, wildcard bits 255.255.255.0</code> (IOS had zeroed the ignored octets), and knew immediately the mask was upside down. Replacing it with <code>0.0.0.255</code> fixed both problems.</p><p><b>Lesson:</b> read back what IOS stored. A strange-looking address in the output reveals a wrong wildcard.</p></div>

<div class="iv"><p class="q">"What is a wildcard mask and how do you calculate one for 10.8.0.0/13?"</p><p>Strong answer: a wildcard says which bits must match (0) and which are ignored (1); for a contiguous subnet it is the inverse of the subnet mask. /13 is 255.248.0.0, so the wildcard is 0.7.255.255 and the range is 10.8.0.0 to 10.15.255.255. Mention host and any as shorthands, and that IOS zeroes address bits under the 1s.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wildcard 0 = must match, 1 = don't care.</li>
<li>For a subnet, wildcard = 255.255.255.255 minus the subnet mask; the interesting octet is block size minus 1.</li>
<li><code>host X</code> = X 0.0.0.0; <code>any</code> = 0.0.0.0 255.255.255.255.</li>
<li>A standard ACL entry without a wildcard is a host entry; extended entries need host or a wildcard.</li>
<li>Typing a subnet mask by mistake is legal syntax but matches the wrong addresses; read back the stored entry.</li>
</ul></div>
`,hi:`
<p>Signboard paint karne wala stencil socho. Jahan stencil solid hai, wahan se paint nahi jaata; jahan kata hua hai, wahan se kuch bhi jaa sakta hai. <b>Wildcard mask</b> 32-bit IPv4 address par rakha gaya ek stencil hai. Jahan mask mein <b>0</b> hai, packet ka bit ACL entry ke bit ke <b>barabar hona chahiye</b>. Jahan mask mein <b>1</b> hai, router ko <b>farak nahi padta</b> ki bit kya hai. Poora idea bas itna hi hai; baaki sab practice hai.</p>

<h3>Seedha subnet mask kyun nahi?</h3>
<p>Subnet mask ek network describe karta hai: 1s ka block aur uske baad 0s ka block. ACLs ko kuch zyada flexible chahiye. Unhe "yeh exact host", "yeh poora subnet", "koi bhi address" aur "har odd-numbered host" jaisi ajeeb cheezein bhi kehni padti hain. Isliye Cisco ulte matlab wala alag mask use karta hai. Normal subnet ke liye wildcard bas subnet mask ka <b>inverse</b> hai: har 1 ban jaata hai 0 aur har 0 ban jaata hai 1.</p>

<dl class="terms">
<dt>Wildcard mein 0 bit</dt><dd>"Is bit ko check karo." Packet ka bit ACL address ke bit se match hona chahiye.</dd>
<dt>Wildcard mein 1 bit</dt><dd>"Is bit ko ignore karo." Koi bhi value chalegi.</dd>
<dt>host A.B.C.D</dt><dd><code>A.B.C.D 0.0.0.0</code> ka shorthand: saare 32 bits check karo, yaani bilkul ek address.</dd>
<dt>any</dt><dd><code>0.0.0.0 255.255.255.255</code> ka shorthand: saare 32 bits ignore karo, yaani har address.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Wildcard bit comparison">
<text x="20" y="40" class="svg-ink" font-size="13">ACL address</text><text x="200" y="40" class="svg-ink" font-size="13">192 . 168 . 10 .</text><rect x="360" y="24" width="200" height="24" rx="4" fill="#e2e8f0"/><text x="460" y="41" text-anchor="middle" class="svg-ink" font-size="13">0000 0000</text>
<text x="20" y="85" class="svg-ink" font-size="13">Wildcard</text><rect x="196" y="69" width="160" height="24" rx="4" fill="#bbf7d0"/><text x="276" y="86" text-anchor="middle" class="svg-ink" font-size="13">0 . 0 . 0 .</text><rect x="360" y="69" width="200" height="24" rx="4" fill="#fde68a"/><text x="460" y="86" text-anchor="middle" class="svg-ink" font-size="13">1111 1111</text>
<text x="276" y="115" text-anchor="middle" class="svg-accent" font-size="12">match zaroori</text><text x="460" y="115" text-anchor="middle" class="svg-accent" font-size="12">farak nahi</text>
<text x="20" y="160" class="svg-ink" font-size="13">Packet 192.168.10.77</text><text x="276" y="160" text-anchor="middle" class="svg-ink" font-size="13">192.168.10 = OK</text><text x="460" y="160" text-anchor="middle" class="svg-muted" font-size="13">77 ignore</text>
<text x="20" y="200" class="svg-ink" font-size="13">Packet 192.168.11.5</text><text x="276" y="200" text-anchor="middle" class="svg-ink" font-size="13">11 10 nahi = NO</text><text x="460" y="200" text-anchor="middle" class="svg-muted" font-size="13">check nahi hua</text>
</svg><p class="cap">192.168.10.0 0.0.0.255: pehle teen octets check hote hain, aakhri octet free hai. Result: 192.168.10.0 se 192.168.10.255.</p></div>

<h3>Quick method: 255 minus mask</h3>
<p>Kisi bhi normal subnet ke liye, subnet mask ke har octet ko 255 mein se ghatao. Result wildcard hai.</p>
<table class="cmp">
<tr><th>Prefix</th><th>Subnet mask</th><th>Wildcard</th><th>Block size</th></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>0.0.0.0 (host)</td><td>1</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>0.0.0.3</td><td>4</td></tr>
<tr><td>/29</td><td>255.255.255.248</td><td>0.0.0.7</td><td>8</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>0.0.0.31</td><td>32</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>0.0.0.63</td><td>64</td></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>0.0.0.255</td><td>256</td></tr>
<tr><td>/20</td><td>255.255.240.0</td><td>0.0.15.255</td><td>4096</td></tr>
<tr><td>/16</td><td>255.255.0.0</td><td>0.0.255.255</td><td>65 536</td></tr>
<tr><td>/0</td><td>0.0.0.0</td><td>255.255.255.255 (any)</td><td>sab</td></tr>
</table>
<p>Pattern dekho: interesting octet mein wildcard hamesha <b>block size minus 1</b> hota hai (3, 7, 31, 63, 255, 15). Agar subnetting se aapko block size pata hai, to wildcard bhi pata hai.</p>

<h3>Router asal mein match kaise test karta hai</h3>
<p>Router sirf un bits ko dekhta hai jahan wildcard 0 hai. Un bits ke liye packet aur ACL address bilkul same hone chahiye. Normal subnet wildcard ke liye ek kaam ka mental shortcut: entry <b>ACL address</b> se <b>ACL address plus wildcard</b> tak har address match karti hai. <code>10.1.32.0 0.0.3.255</code> ke liye yeh 10.1.32.0 se 10.1.35.255 tak hai.</p>

<div class="eg"><p><b>Worked example.</b> /27 subnet 172.16.5.96 mask 255.255.255.224 match karo. Wildcard: 255 minus 224 = 31, isliye <code>172.16.5.96 0.0.0.31</code>. Range: 172.16.5.96 se 172.16.5.127 (96 + 31). Kya 172.16.5.130 match karta hai? 130, 127 se aage hai, isliye nahi. Kya 172.16.5.100 match karta hai? Haan. Binary mein 96 hai 011 00000 aur 100 hai 011 00100: upar ke teen bits (checked) barabar hain, aur aakhri paanch (ignored) alag hain, jo theek hai.</p></div>

<h3>IOS aapke address bits saaf kar deta hai</h3>
<p>Agar aap aisa address type karte ho jiske "farak nahi padta" positions mein 1s hain, to IOS chupchaap unhe zero kar deta hai. <code>access-list 10 permit 10.1.1.77 0.0.0.255</code> type karo aur running config <code>10.1.1.0, wildcard bits 0.0.0.255</code> dikhata hai. Yahan yeh harmless hai, par yeh ek clue hai: agar config aisa network dikhaye jo aapne nahi socha tha, to aapka wildcard aapki soch se zyada chauda tha.</p>
<pre class="code"><span class="c">! Standard ACL mein ek host match karne ke teen tareeke</span>
R1(config)# access-list 5 permit host 10.1.1.5
R1(config)# access-list 5 permit 10.1.1.5 0.0.0.0
R1(config)# access-list 5 permit 10.1.1.5
<span class="c">! Standard ACL mein wildcard na ho to matlab 0.0.0.0 (host)</span></pre>
<pre class="out">R1# show access-lists 5
Standard IP access list 5
    <span class="hl">10 permit 10.1.1.5</span></pre>
<p>Teeno lines ka matlab ek hi hai; IOS ise ek baar store karta hai aur host ko bina wildcard ke dikhata hai. <b>Extended</b> ACL mein aap wildcard chhod nahi sakte: <code>host</code> use karo ya <code>0.0.0.0</code> likho.</p>

<div class="warn"><p><b>Common galti.</b> Wildcard ki jagah subnet mask type karna: <code>access-list 10 deny 10.1.20.0 255.255.255.0</code>. IOS ise accept kar leta hai, kyunki yeh legal wildcard hai, par ab yeh pehle teen octets ignore karta hai aur sirf aakhri check karta hai. Yeh duniya ka har woh address match karta hai jo .0 par khatam hota hai, aur guest subnet bilkul block nahi hota. Hamesha sanity-check karo: subnet ka wildcard 0s se shuru hota hai, 255s se nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam <code>0.0.0.0 255.255.255.255</code> aur <code>any</code> ko alag answers ki tarah dikha sakta hai; dono identical hain. Isi tarah <code>host 10.1.1.1</code> barabar hai <code>10.1.1.1 0.0.0.0</code> ke. Aur 0.0.0.255 wildcard ka matlab /24 hai, /8 nahi.</p></div>

<div class="scn"><h4>Woh deny jisne poori company block kar di</h4><p>Ek junior engineer ko guest subnet 10.1.20.0/24 ko ek server tak pahunchne se rokne ko kaha gaya. Usne <code>access-list 12 deny 10.1.20.0 255.255.255.0</code> likha aur uske baad <code>access-list 12 permit any</code>. Guests ab bhi server tak pahunch rahe the, aur helpdesk ko baad mein .0 par khatam hone wale hosts ajeeb jagahon par block hote mile. Senior engineer ne <code>show access-lists 12</code> padha, <code>deny 0.0.0.0, wildcard bits 255.255.255.0</code> dekha (IOS ne ignored octets zero kar diye the), aur turant samajh gaya ki mask ulta hai. Use <code>0.0.0.255</code> se badalne par dono problems theek ho gayi.</p><p><b>Seekh:</b> IOS ne jo store kiya use wapas padho. Output mein ajeeb dikhne wala address galat wildcard ko expose karta hai.</p></div>

<div class="iv"><p class="q">"Wildcard mask kya hai aur 10.8.0.0/13 ke liye kaise calculate karoge?"</p><p>Strong answer: wildcard batata hai ki kaunse bits match hone chahiye (0) aur kaunse ignore hote hain (1); contiguous subnet ke liye yeh subnet mask ka inverse hai. /13 matlab 255.248.0.0, isliye wildcard 0.7.255.255 hai aur range 10.8.0.0 se 10.15.255.255. host aur any shorthands batao, aur yeh ki IOS 1s ke neeche wale address bits ko zero kar deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wildcard 0 = match zaroori, 1 = farak nahi padta.</li>
<li>Subnet ke liye wildcard = 255.255.255.255 minus subnet mask; interesting octet block size minus 1 hota hai.</li>
<li><code>host X</code> = X 0.0.0.0; <code>any</code> = 0.0.0.0 255.255.255.255.</li>
<li>Bina wildcard ki standard ACL entry host entry hai; extended entries ko host ya wildcard chahiye.</li>
<li>Galti se subnet mask type karna legal syntax hai par galat addresses match karta hai; stored entry wapas padho.</li>
</ul></div>
`}};export{e as default};