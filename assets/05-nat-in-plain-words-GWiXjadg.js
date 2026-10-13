var e={id:`nat-in-plain-words`,h:{en:`NAT in plain words`,hi:`NAT saral shabdon mein`},body:{en:`
<p>Think of an office with one street address and a switchboard. Employees have internal extensions (private addresses). When one phones out, the switchboard places the call with the company's main number (the public address) and remembers which extension asked, so the answer returns to the right desk. That switchboard is <b>NAT</b>, Network Address Translation: the firewall rewrites addresses in packets and remembers the translation in the session.</p>
<h3>Why we need it</h3>
<p>Private ranges such as 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16 are not routable on the internet, and public IPv4 addresses are scarce. NAT lets hundreds of private hosts share one public address, and it lets a server with a private address be reached from the internet.</p>
<h3>The two directions of NAT</h3>
<ul>
<li><b>Source NAT (SNAT).</b> Rewrites the <i>source</i> address of packets leaving the network. Used so the LAN can browse the internet. On a FortiGate you turn it on inside the policy with <code>set nat enable</code> and the source becomes the egress interface address. This is also called <b>overload</b> or PAT, because many hosts share one address and the firewall tells them apart by port.</li>
<li><b>Destination NAT (DNAT).</b> Rewrites the <i>destination</i> address of packets arriving from outside, so that a request to a public address reaches a private server. On a FortiGate this is a <b>virtual IP (VIP)</b> object, which is then used as the destination address in a policy.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Source NAT with overload"><rect x="10" y="60" width="130" height="70" rx="9" fill="#bbf7d0"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC 10.0.1.10</text><text x="75" y="109" text-anchor="middle" class="svg-muted" font-size="11">private source</text><line x1="140" y1="95" x2="215" y2="95" stroke="#64748b" stroke-width="2"/><text x="178" y="88" text-anchor="middle" class="svg-accent" font-size="11">src 10.0.1.10</text><rect x="215" y="55" width="210" height="80" rx="9" fill="#fde68a"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="320" y="109" text-anchor="middle" class="svg-muted" font-size="11">nat enable</text><line x1="425" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/><text x="462" y="88" text-anchor="middle" class="svg-accent" font-size="11">src 203.0.113.2</text><rect x="500" y="60" width="130" height="70" rx="9" fill="#e2e8f0"/><text x="565" y="92" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="565" y="109" text-anchor="middle" class="svg-muted" font-size="11">8.8.8.8</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Source NAT: the source changes on the way out and changes back on the reply</text></svg><p class="cap">Source NAT with overload</p></div>
<h3>Real evidence of source NAT</h3>
<p>The session entry from the previous chapter already shows it. The PC address 10.0.1.10 and source port 19499 were rewritten to the WAN address 203.0.113.2 and port 40001, and the reply is translated back:</p>
<pre class="out">hook=post dir=org act=snat <span class="hl">10.0.1.10:19499-&gt;8.8.8.8:8(203.0.113.2:40001)</span>
hook=pre dir=reply act=dnat <span class="hl">8.8.8.8:40001-&gt;203.0.113.2:0(10.0.1.10:19499)</span></pre>
<p>When the policy has <code>set nat enable</code> with no pool, the translated address is the egress interface address. An <b>IP pool</b> lets you choose other public addresses instead, which is covered in the nse4-nat module.</p>
<h3>Destination NAT with a virtual IP</h3>
<p>To publish an internal web server you create a VIP that maps an external address to the real address, then use the VIP as the <code>dstaddr</code> of a policy from the WAN interface to the server's interface. Without that policy the VIP alone permits nothing. The following is a reference configuration (not run in this chapter; you practise it in the nse4-nat labs):</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator in this chapter)</span>
config firewall vip
    edit "WEB-VIP"
        set extip 203.0.113.10
        set mappedip "10.0.2.20"
        set extintf "port1"
        set portforward enable
        set extport 443
        set mappedport 443
    next
end</pre>
<table class="cmp"><tr><th></th><th>Source NAT</th><th>Destination NAT (VIP)</th></tr><tr><td>Rewrites</td><td>source address</td><td>destination address</td></tr><tr><td>Direction</td><td>LAN to internet</td><td>internet to server</td></tr><tr><td>FortiOS object</td><td><code>nat enable</code> or IP pool</td><td>virtual IP used as dstaddr</td></tr><tr><td>Typical use</td><td>browsing</td><td>publish a web server</td></tr></table>
<div class="eg"><p><b>Worked example.</b> 200 users browse through one WAN address. Each connection uses a different translated source port, so the firewall can send each reply to the right PC. About 64,000 ports exist per address and protocol, which is why a large site may add a pool of several public addresses.</p></div>
<div class="warn"><p><b>Common mistake.</b> Enabling NAT between two private networks, such as LAN to DMZ. It hides real source addresses in logs and breaks per-host rules. Use NAT only where traffic crosses toward a different address space, normally the internet.</p></div>
<div class="exam"><p><b>Exam trap.</b> A VIP does not allow traffic by itself. You still need a firewall policy that uses the VIP as destination. Also, <code>nat enable</code> sits in the policy, not on the interface.</p></div>
<div class="scn"><h4>The published server that nobody could reach</h4><p>An engineer created a VIP for the company website and tested from the internet: timeout. The VIP was correct, the server was up, but no policy from the WAN interface to the server used the VIP as destination, so the implicit deny dropped the request. Adding the policy fixed it in a minute.</p><p><b>Lesson:</b> publishing needs both the VIP object and a policy that references it.</p></div>
<div class="iv"><p class="q">"How do you let internet users reach an internal web server on a FortiGate?"</p><p>Create a virtual IP mapping the public address (and optionally port) to the server's private address, then add a policy from the WAN interface to the server's interface with the VIP as destination address and the right service, for example HTTPS. Then check the session table and policy hit counts. Say that source NAT and destination NAT are separate mechanisms.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT rewrites addresses and the session remembers the translation.</li>
<li>Source NAT (<code>nat enable</code>) lets private hosts reach the internet.</li>
<li>A VIP is destination NAT and needs a policy that uses it.</li>
<li>Do not NAT between internal networks without a reason.</li>
</ul></div>
`,hi:`
<p>Ek office socho jiska ek street address aur ek switchboard hai. Employees ke internal extensions hain (private addresses). Jab koi bahar phone karta hai to switchboard company ke main number (public address) se call lagata hai aur yaad rakhta hai ki kaunse extension ne maanga, taaki jawab sahi desk par wapas aaye. Woh switchboard hai <b>NAT</b>, Network Address Translation: firewall packets ke addresses badalta hai aur translation ko session mein yaad rakhta hai.</p>
<h3>Hamein iski zaroorat kyun hai</h3>
<p>10.0.0.0/8, 172.16.0.0/12 aur 192.168.0.0/16 jaise private ranges internet par routable nahi hote, aur public IPv4 addresses kam hain. NAT sainkdon private hosts ko ek public address share karne deta hai, aur private address wale server ko internet se reachable banata hai.</p>
<h3>NAT ke do directions</h3>
<ul>
<li><b>Source NAT (SNAT).</b> Network se bahar jaate packets ka <i>source</i> address badalta hai. Isse LAN internet browse kar paata hai. FortiGate par ise policy ke andar <code>set nat enable</code> se on karte hain aur source egress interface ka address ban jaata hai. Ise <b>overload</b> ya PAT bhi kehte hain, kyunki kai hosts ek address share karte hain aur firewall unhe port se alag karta hai.</li>
<li><b>Destination NAT (DNAT).</b> Bahar se aate packets ka <i>destination</i> address badalta hai, taaki public address par request private server tak pahunche. FortiGate par yeh <b>virtual IP (VIP)</b> object hai, jise phir policy mein destination address ki tarah use karte hain.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Overload ke saath source NAT"><rect x="10" y="60" width="130" height="70" rx="9" fill="#bbf7d0"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC 10.0.1.10</text><text x="75" y="109" text-anchor="middle" class="svg-muted" font-size="11">private source</text><line x1="140" y1="95" x2="215" y2="95" stroke="#64748b" stroke-width="2"/><text x="178" y="88" text-anchor="middle" class="svg-accent" font-size="11">src 10.0.1.10</text><rect x="215" y="55" width="210" height="80" rx="9" fill="#fde68a"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="320" y="109" text-anchor="middle" class="svg-muted" font-size="11">nat enable</text><line x1="425" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/><text x="462" y="88" text-anchor="middle" class="svg-accent" font-size="11">src 203.0.113.2</text><rect x="500" y="60" width="130" height="70" rx="9" fill="#e2e8f0"/><text x="565" y="92" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="565" y="109" text-anchor="middle" class="svg-muted" font-size="11">8.8.8.8</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Source NAT: source jaate waqt badalta hai aur reply par wapas badalta hai</text></svg><p class="cap">Overload ke saath source NAT</p></div>
<h3>Source NAT ka asli saboot</h3>
<p>Pichhle chapter ki session entry yeh pehle hi dikha chuki hai. PC address 10.0.1.10 aur source port 19499 ko WAN address 203.0.113.2 aur port 40001 mein badla gaya, aur reply wapas translate hota hai:</p>
<pre class="out">hook=post dir=org act=snat <span class="hl">10.0.1.10:19499-&gt;8.8.8.8:8(203.0.113.2:40001)</span>
hook=pre dir=reply act=dnat <span class="hl">8.8.8.8:40001-&gt;203.0.113.2:0(10.0.1.10:19499)</span></pre>
<p>Policy mein <code>set nat enable</code> ho aur koi pool na ho to translated address egress interface ka address hota hai. <b>IP pool</b> aapko iski jagah doosre public addresses chunne deta hai, jo nse4-nat module mein cover hai.</p>
<h3>Virtual IP ke saath destination NAT</h3>
<p>Internal web server publish karne ke liye aap ek VIP banate ho jo external address ko real address se map karta hai, phir VIP ko WAN interface se server ke interface ki policy ke <code>dstaddr</code> mein use karte ho. VIP akele kuch permit nahi karta. Neeche reference configuration hai (is chapter mein run nahi hui; aap ise nse4-nat labs mein practice karoge):</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator in this chapter)</span>
config firewall vip
    edit "WEB-VIP"
        set extip 203.0.113.10
        set mappedip "10.0.2.20"
        set extintf "port1"
        set portforward enable
        set extport 443
        set mappedport 443
    next
end</pre>
<table class="cmp"><tr><th></th><th>Source NAT</th><th>Destination NAT (VIP)</th></tr><tr><td>Kya badalta hai</td><td>source address</td><td>destination address</td></tr><tr><td>Direction</td><td>LAN se internet</td><td>internet se server</td></tr><tr><td>FortiOS object</td><td><code>nat enable</code> ya IP pool</td><td>virtual IP jo dstaddr mein use hota hai</td></tr><tr><td>Aam use</td><td>browsing</td><td>web server publish karna</td></tr></table>
<div class="eg"><p><b>Worked example.</b> 200 users ek WAN address se browse karte hain. Har connection alag translated source port use karta hai, isliye firewall har reply sahi PC ko bhej paata hai. Har address aur protocol par kareeb 64,000 ports hote hain, isliye bade site kai public addresses ka pool jod sakte hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Do private networks ke beech NAT enable karna, jaise LAN se DMZ. Yeh logs mein asli source addresses chhupa deta hai aur per-host rules tod deta hai. NAT sirf wahan lagao jahan traffic alag address space ki taraf jata hai, aam taur par internet.</p></div>
<div class="exam"><p><b>Exam trap.</b> VIP akele traffic allow nahi karta. Aapko VIP ko destination ki tarah use karne wali firewall policy chahiye. Ye bhi: <code>nat enable</code> policy mein hota hai, interface par nahi.</p></div>
<div class="scn"><h4>Published server jise koi reach nahi kar paya</h4><p>Ek engineer ne company website ke liye VIP banaya aur internet se test kiya: timeout. VIP sahi tha, server up tha, par WAN interface se server tak koi policy VIP ko destination ki tarah use nahi kar rahi thi, isliye implicit deny ne request drop kar di. Policy add karte hi ek minute mein theek ho gaya.</p><p><b>Lesson:</b> publish karne ke liye VIP object aur use refer karne wali policy dono chahiye.</p></div>
<div class="iv"><p class="q">"FortiGate par internet users ko internal web server tak kaise pahunchate ho?"</p><p>Ek virtual IP banao jo public address (aur optional port) ko server ke private address se map kare, phir WAN interface se server ke interface tak policy add karo jisme VIP destination address ho aur sahi service ho, jaise HTTPS. Phir session table aur policy hit counts check karo. Batao ki source NAT aur destination NAT alag mechanisms hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT addresses badalta hai aur session translation yaad rakhta hai.</li>
<li>Source NAT (<code>nat enable</code>) private hosts ko internet tak pahunchata hai.</li>
<li>VIP destination NAT hai aur use use karne wali policy chahiye.</li>
<li>Bina wajah internal networks ke beech NAT mat karo.</li>
</ul></div>
`}};export{e as default};