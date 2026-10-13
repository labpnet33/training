var e={id:`pat`,h:{en:`Dynamic PAT with object NAT`,hi:`Object NAT ke saath dynamic PAT`},body:{en:`
<p>Imagine a company with 200 employees and one postal address. Every letter leaves with the company address as the return address, and the mailroom writes in a register which employee sent which letter, with a reference number. When the reply arrives with that reference number, the mailroom knows exactly whose desk it goes to. That is <b>PAT</b> (Port Address Translation): many private hosts share one public address, and the port number is the reference number.</p>

<h3>Why the ASA must translate</h3>
<p>The inside network 10.0.1.0/24 is private (RFC 1918). Routers on the internet do not carry routes for private ranges, and the ISP in our lab only knows 203.0.113.0/29 toward the ASA. If PC1's packet left with source 10.0.1.10, it might even reach 8.8.8.8, but the reply to 10.0.1.10 would have nowhere to go. After PAT, the packet leaves with source 203.0.113.2, a subnet the ISP routes straight back to the ASA.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="PAT translation">
<rect x="10" y="30" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.0.1.10</text><text x="75" y="66" text-anchor="middle" class="svg-muted" font-size="11">port 51544</text>
<rect x="10" y="110" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="130" text-anchor="middle" class="svg-ink" font-size="12">ADMIN 10.0.1.50</text><text x="75" y="146" text-anchor="middle" class="svg-muted" font-size="11">port 51544</text>
<rect x="240" y="60" width="150" height="64" rx="10" fill="#fed7aa"/><text x="315" y="88" text-anchor="middle" class="svg-ink" font-size="14">ASA PAT</text><text x="315" y="108" text-anchor="middle" class="svg-muted" font-size="11">xlate table</text>
<line x1="140" y1="52" x2="240" y2="85" stroke="#64748b"/><line x1="140" y1="132" x2="240" y2="100" stroke="#64748b"/>
<rect x="470" y="30" width="160" height="44" rx="8" fill="#fde68a"/><text x="550" y="50" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2</text><text x="550" y="66" text-anchor="middle" class="svg-muted" font-size="11">port 51544</text>
<rect x="470" y="110" width="160" height="44" rx="8" fill="#fde68a"/><text x="550" y="130" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2</text><text x="550" y="146" text-anchor="middle" class="svg-muted" font-size="11">port 13977 (changed)</text>
<line x1="390" y1="85" x2="470" y2="52" stroke="#64748b"/><line x1="390" y1="100" x2="470" y2="132" stroke="#64748b"/>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Same source port on two hosts: the ASA picks a different mapped port for the second one.</text>
</svg><p class="cap">Both hosts share 203.0.113.2; the mapped port keeps their sessions apart.</p></div>

<h3>Object NAT (auto NAT)</h3>
<p>Since ASA 8.3, the normal way to write NAT is inside a <b>network object</b>. This is called <b>object NAT</b> or <b>auto NAT</b>:</p>
<pre class="code"><span class="c">! 1. describe the real addresses</span>
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
<span class="c">! 2. same object: translate when going from inside to outside</span>
 nat (inside,outside) dynamic interface</pre>
<ul>
<li><code>object network INSIDE-NET</code> creates a named object. It can hold a <code>host</code>, a <code>subnet</code> or a <code>range</code>.</li>
<li><code>nat (inside,outside)</code>: the first name is the <b>real interface</b> (where the real addresses live), the second is the <b>mapped interface</b> (where the translated address is used).</li>
<li><code>dynamic interface</code>: dynamic PAT to the mapped interface's own address, 203.0.113.2. If that address changes (DHCP from the ISP), PAT follows it automatically.</li>
</ul>
<p>Alternatives you will meet: <code>nat (inside,outside) dynamic 203.0.113.5</code> uses a different public address for PAT, and <b>static NAT</b> for publishing servers is the subject of the NAT module. There is also <b>twice NAT</b> (manual NAT), which matches source and destination together. The ASA evaluates NAT in three sections: manual NAT first (section 1), object NAT (section 2), then manual NAT placed <code>after-auto</code> (section 3).</p>

<h3>One rule per zone</h3>
<p>The rule above only covers inside to outside. Traffic from inside to the DMZ is not translated (no rule matches that pair), which is what you want internally. But the DMZ needs its own rule to reach the internet:</p>
<pre class="code">object network DMZ-NET
 subnet 10.0.2.0 255.255.255.0
 nat (dmz,outside) dynamic interface</pre>
<p>Forgetting this rule is the second fault in the DMZ lab ticket.</p>

<h3>Verification</h3>
<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
<span class="hl">1 (inside) to (outside) source dynamic INSIDE-NET interface</span>
    translate_hits = 42, untranslate_hits = 3
2 (dmz) to (outside) source dynamic DMZ-NET interface
    translate_hits = 0, untranslate_hits = 0
NK-ASA# show logging | include 305011
%ASA-6-305011: Built dynamic TCP translation from inside:10.0.1.10/51544 to <span class="hl">outside:203.0.113.2/51544</span></pre>
<p><code>translate_hits</code> counts new translations built by the rule; if it stays at 0 while users test, the traffic is not matching this rule (wrong interface pair, wrong subnet, or it is dropped earlier). <code>show xlate</code> (chapter 8) shows the live translations.</p>

<div class="eg"><p><b>Worked example (lab task 3).</b> You create INSIDE-NET for 10.0.1.0/24 with <code>nat (inside,outside) dynamic interface</code>. PC1 runs <code>curl 8.8.8.8</code>: the page loads. <code>show xlate</code> shows <code>TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri</code>, and <code>show nat</code> shows translate_hits increasing. The server 8.8.8.8 sees the request coming from 203.0.113.2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Swapping the interfaces: <code>nat (outside,inside)</code> means the real addresses live on the outside, which is the opposite of what you want. Writing the mask as a wildcard. Typing <code>nat</code> outside the object context (at the global prompt a different, manual NAT syntax is expected). Testing with ping and concluding NAT is broken: ping replies also need ICMP inspection (chapter 10); test with TCP first.</p></div>

<div class="exam"><p><b>Exam trap.</b> In <code>nat (real_ifc,mapped_ifc)</code> the <b>real</b> interface comes first. And a preview of the "real-IP rule" from the next module: since ASA 8.3, interface ACLs are written with the <b>real</b> (untranslated) address of a server, not its public mapped address.</p></div>

<div class="scn"><h4>Browsing died when the ISP changed the address</h4><p>A branch ASA got its outside address by DHCP. Its PAT had been written as <code>nat (inside,outside) dynamic 198.51.100.77</code>, the address the ISP had given at installation. Months later the ISP changed the lease to a new address and browsing stopped: the ASA kept translating to 198.51.100.77, which the ISP no longer routed back. Changing the rule to <code>dynamic interface</code> made PAT follow whatever address the interface holds.</p><p><b>Lesson:</b> when PAT should use the outside interface address, say <code>interface</code>, not the literal IP.</p></div>

<div class="iv"><p class="q">"Configure PAT for the inside network on an ASA and explain each line."</p><p>Strong answer: <code>object network INSIDE-NET</code>, <code>subnet 10.0.1.0 255.255.255.0</code>, <code>nat (inside,outside) dynamic interface</code>. The object defines the real addresses; the interface pair is real then mapped; <code>dynamic interface</code> performs PAT to the outside interface address, using ports to separate sessions. Verify with <code>show nat</code> (hit counters), <code>show xlate</code> (flags ri) and syslog 305011. Mention the three NAT sections and that ACLs use real IPs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAT lets many private hosts share one public address, separated by port numbers.</li>
<li>Object NAT: <code>object network</code> + <code>subnet</code> + <code>nat (real,mapped) dynamic interface</code>.</li>
<li>Each zone that goes to the internet (inside, dmz) needs its own rule.</li>
<li>NAT order: manual (section 1), object (section 2), manual after-auto (section 3).</li>
<li>Verify with <code>show nat</code>, <code>show xlate</code> and syslog 305011.</li>
</ul></div>
`,hi:`
<p>Ek company socho jismein 200 employees hain aur ek postal address. Har chitthi company address ko return address bana kar nikalti hai, aur mailroom ek register mein likhta hai ki kis employee ne kaunsi chitthi bheji, ek reference number ke saath. Jab jawab us reference number ke saath aata hai, to mailroom ko exactly pata hota hai ki woh kis desk par jaayega. Yahi <b>PAT</b> (Port Address Translation) hai: bahut saare private hosts ek public address share karte hain, aur port number reference number hai.</p>

<h3>ASA ko translate kyun karna padta hai</h3>
<p>Inside network 10.0.1.0/24 private hai (RFC 1918). Internet ke routers private ranges ke routes nahi rakhte, aur hamare lab mein ISP ASA ki taraf sirf 203.0.113.0/29 jaanta hai. Agar PC1 ka packet source 10.0.1.10 ke saath nikalta, to shayad 8.8.8.8 tak pahunch bhi jaata, lekin 10.0.1.10 ke liye reply ke paas jaane ki koi jagah nahi hoti. PAT ke baad packet source 203.0.113.2 ke saath nikalta hai, ek aisa subnet jise ISP seedha ASA ki taraf wapas route karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="PAT translation">
<rect x="10" y="30" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.0.1.10</text><text x="75" y="66" text-anchor="middle" class="svg-muted" font-size="11">port 51544</text>
<rect x="10" y="110" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="130" text-anchor="middle" class="svg-ink" font-size="12">ADMIN 10.0.1.50</text><text x="75" y="146" text-anchor="middle" class="svg-muted" font-size="11">port 51544</text>
<rect x="240" y="60" width="150" height="64" rx="10" fill="#fed7aa"/><text x="315" y="88" text-anchor="middle" class="svg-ink" font-size="14">ASA PAT</text><text x="315" y="108" text-anchor="middle" class="svg-muted" font-size="11">xlate table</text>
<line x1="140" y1="52" x2="240" y2="85" stroke="#64748b"/><line x1="140" y1="132" x2="240" y2="100" stroke="#64748b"/>
<rect x="470" y="30" width="160" height="44" rx="8" fill="#fde68a"/><text x="550" y="50" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2</text><text x="550" y="66" text-anchor="middle" class="svg-muted" font-size="11">port 51544</text>
<rect x="470" y="110" width="160" height="44" rx="8" fill="#fde68a"/><text x="550" y="130" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2</text><text x="550" y="146" text-anchor="middle" class="svg-muted" font-size="11">port 13977 (badla)</text>
<line x1="390" y1="85" x2="470" y2="52" stroke="#64748b"/><line x1="390" y1="100" x2="470" y2="132" stroke="#64748b"/>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Do hosts ka same source port: ASA doosre ke liye alag mapped port chunta hai.</text>
</svg><p class="cap">Dono hosts 203.0.113.2 share karte hain; mapped port unke sessions ko alag rakhta hai.</p></div>

<h3>Object NAT (auto NAT)</h3>
<p>ASA 8.3 se NAT likhne ka normal tareeka ek <b>network object</b> ke andar hai. Ise <b>object NAT</b> ya <b>auto NAT</b> kehte hain:</p>
<pre class="code"><span class="c">! 1. real addresses describe karo</span>
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
<span class="c">! 2. wahi object: inside se outside jaate waqt translate karo</span>
 nat (inside,outside) dynamic interface</pre>
<ul>
<li><code>object network INSIDE-NET</code> ek named object banata hai. Isme <code>host</code>, <code>subnet</code> ya <code>range</code> ho sakta hai.</li>
<li><code>nat (inside,outside)</code>: pehla naam <b>real interface</b> hai (jahan real addresses rehte hain), doosra <b>mapped interface</b> hai (jahan translated address use hota hai).</li>
<li><code>dynamic interface</code>: mapped interface ke apne address, 203.0.113.2, par dynamic PAT. Agar woh address badle (ISP se DHCP), to PAT apne aap use follow karta hai.</li>
</ul>
<p>Alternatives jo aapko milenge: <code>nat (inside,outside) dynamic 203.0.113.5</code> PAT ke liye alag public address use karta hai, aur servers publish karne ke liye <b>static NAT</b> NAT module ka topic hai. <b>Twice NAT</b> (manual NAT) bhi hai, jo source aur destination ko ek saath match karta hai. ASA NAT ko teen sections mein evaluate karta hai: pehle manual NAT (section 1), phir object NAT (section 2), phir <code>after-auto</code> rakha manual NAT (section 3).</p>

<h3>Har zone ke liye ek rule</h3>
<p>Upar wala rule sirf inside se outside cover karta hai. Inside se DMZ ka traffic translate nahi hota (us pair se koi rule match nahi karta), jo andar ke liye aap chahte bhi ho. Lekin DMZ ko internet tak pahunchne ke liye apna rule chahiye:</p>
<pre class="code">object network DMZ-NET
 subnet 10.0.2.0 255.255.255.0
 nat (dmz,outside) dynamic interface</pre>
<p>Yeh rule bhoolna DMZ lab ticket ka doosra fault hai.</p>

<h3>Verification</h3>
<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
<span class="hl">1 (inside) to (outside) source dynamic INSIDE-NET interface</span>
    translate_hits = 42, untranslate_hits = 3
2 (dmz) to (outside) source dynamic DMZ-NET interface
    translate_hits = 0, untranslate_hits = 0
NK-ASA# show logging | include 305011
%ASA-6-305011: Built dynamic TCP translation from inside:10.0.1.10/51544 to <span class="hl">outside:203.0.113.2/51544</span></pre>
<p><code>translate_hits</code> rule se bani nayi translations ginta hai; agar users ke test karte waqt yeh 0 par ruka rahe, to traffic is rule se match nahi ho raha (galat interface pair, galat subnet, ya pehle hi drop ho raha hai). <code>show xlate</code> (chapter 8) live translations dikhata hai.</p>

<div class="eg"><p><b>Worked example (lab task 3).</b> Aap 10.0.1.0/24 ke liye INSIDE-NET <code>nat (inside,outside) dynamic interface</code> ke saath banate ho. PC1 <code>curl 8.8.8.8</code> chalata hai: page load hota hai. <code>show xlate</code> dikhata hai <code>TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri</code>, aur <code>show nat</code> mein translate_hits badhte dikhte hain. Server 8.8.8.8 ko request 203.0.113.2 se aati dikhti hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Interfaces ulat dena: <code>nat (outside,inside)</code> ka matlab hai real addresses outside par rehte hain, jo aapki chahat ka ulta hai. Mask ko wildcard ki tarah likhna. Object context ke bahar <code>nat</code> type karna (global prompt par alag, manual NAT syntax expect hota hai). Ping se test karke nateeja nikaalna ki NAT toota hai: ping replies ko ICMP inspection bhi chahiye (chapter 10); pehle TCP se test karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>nat (real_ifc,mapped_ifc)</code> mein <b>real</b> interface pehle aata hai. Aur agle module ke "real-IP rule" ka preview: ASA 8.3 se interface ACLs server ke <b>real</b> (untranslated) address se likhe jaate hain, uske public mapped address se nahi.</p></div>

<div class="scn"><h4>ISP ne address badla aur browsing mar gayi</h4><p>Ek branch ASA apna outside address DHCP se leta tha. Uska PAT <code>nat (inside,outside) dynamic 198.51.100.77</code> likha gaya tha, woh address jo ISP ne installation par diya tha. Mahino baad ISP ne lease naye address mein badal di aur browsing ruk gayi: ASA 198.51.100.77 mein translate karta raha, jise ISP ab wapas route nahi karta tha. Rule ko <code>dynamic interface</code> mein badalne se PAT us address ko follow karne laga jo interface ke paas hai.</p><p><b>Seekh:</b> jab PAT ko outside interface address use karna ho, to <code>interface</code> likho, literal IP nahi.</p></div>

<div class="iv"><p class="q">"ASA par inside network ke liye PAT configure karo aur har line samjhao."</p><p>Strong answer: <code>object network INSIDE-NET</code>, <code>subnet 10.0.1.0 255.255.255.0</code>, <code>nat (inside,outside) dynamic interface</code>. Object real addresses define karta hai; interface pair pehle real phir mapped hai; <code>dynamic interface</code> outside interface address par PAT karta hai, sessions ko ports se alag karte hue. <code>show nat</code> (hit counters), <code>show xlate</code> (flags ri) aur syslog 305011 se verify karo. Teen NAT sections aur yeh ki ACLs real IPs use karte hain, mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAT bahut saare private hosts ko ek public address share karne deta hai, port numbers se alag kiye hue.</li>
<li>Object NAT: <code>object network</code> + <code>subnet</code> + <code>nat (real,mapped) dynamic interface</code>.</li>
<li>Har zone jo internet par jaata hai (inside, dmz) use apna rule chahiye.</li>
<li>NAT order: manual (section 1), object (section 2), manual after-auto (section 3).</li>
<li><code>show nat</code>, <code>show xlate</code> aur syslog 305011 se verify karo.</li>
</ul></div>
`}};export{e as default};