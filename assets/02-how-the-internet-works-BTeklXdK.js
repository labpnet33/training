var e={id:`internet`,h:{en:`How the internet works, end to end`,hi:`Internet shuru se end tak kaise kaam karta hai`},body:{en:`
<p>Imagine the road network of India. Your lane joins a colony road, the colony road joins a city road, the city road joins a national highway, and highways meet at big junctions. Nobody owns all the roads: the colony owns its lane, the city owns its roads, and the national authority owns the highways. Yet a truck can drive from your gate to any address in the country because everyone follows the same rules of the road. The internet is built exactly like that.</p>

<h3>The big picture in one drawing</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Path from a home to a data center across the internet">
<rect x="10" y="90" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="60" y="110" text-anchor="middle" class="svg-ink" font-size="13">Home devices</text><text x="60" y="126" text-anchor="middle" class="svg-muted" font-size="12">phone, laptop</text>
<rect x="130" y="90" width="90" height="44" rx="8" fill="#bae6fd"/><text x="175" y="110" text-anchor="middle" class="svg-ink" font-size="13">Home router</text><text x="175" y="126" text-anchor="middle" class="svg-muted" font-size="12">+ Wi-Fi</text>
<rect x="240" y="90" width="90" height="44" rx="8" fill="#fed7aa"/><text x="285" y="110" text-anchor="middle" class="svg-ink" font-size="13">Local ISP</text><text x="285" y="126" text-anchor="middle" class="svg-muted" font-size="12">access network</text>
<rect x="350" y="80" width="120" height="64" rx="8" fill="#ddd6fe"/><text x="410" y="106" text-anchor="middle" class="svg-ink" font-size="13">Backbone</text><text x="410" y="124" text-anchor="middle" class="svg-muted" font-size="12">big ISPs, IXPs,</text><text x="410" y="138" text-anchor="middle" class="svg-muted" font-size="12">sea cables</text>
<rect x="490" y="90" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">Data center</text><text x="560" y="126" text-anchor="middle" class="svg-muted" font-size="12">web servers</text>
<line x1="110" y1="112" x2="130" y2="112" stroke="#64748b" stroke-width="2"/><line x1="220" y1="112" x2="240" y2="112" stroke="#64748b" stroke-width="2"/><line x1="330" y1="112" x2="350" y2="112" stroke="#64748b" stroke-width="2"/><line x1="470" y1="112" x2="490" y2="112" stroke="#64748b" stroke-width="2"/>
<rect x="240" y="190" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">DNS servers</text><text x="320" y="226" text-anchor="middle" class="svg-muted" font-size="12">name to IP lookup</text>
<line x1="175" y1="134" x2="260" y2="190" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="13">Your request travels left to right; the reply comes back right to left</text>
</svg><p class="cap">Home, ISP, backbone, data center, with DNS answering "which address is that name?" on the side.</p></div>

<h3>The pieces, from your room outwards</h3>
<dl class="terms">
<dt>Home devices</dt><dd>Phones, laptops, smart TVs. Each one has a network card (Wi-Fi or Ethernet) and gets an address from your home router.</dd>
<dt>Home router</dt><dd>The small box from your internet provider. It is really several devices in one: a router (joins your home network to the ISP), a switch (a few LAN ports), a Wi-Fi access point, a basic firewall, and a DHCP server that hands out addresses. It also does NAT, letting all your devices share the one public address the ISP gives you. You will study each of these separately.</dd>
<dt>ISP (Internet Service Provider)</dt><dd>The company you pay for internet access. Your connection reaches the ISP over fibre (FTTH), cable, DSL on a phone line, or mobile (4G/5G). The ISP's <b>access network</b> collects thousands of customers and sends their traffic to its core routers.</dd>
<dt>Backbone</dt><dd>Large providers (often called <b>tier 1</b> and <b>tier 2</b> ISPs) run very fast fibre networks across countries and under the sea. They connect to each other at <b>IXPs</b> (Internet Exchange Points), buildings where many networks plug into shared switches to swap traffic, and through private links. Undersea cables carry most traffic between continents.</dd>
<dt>Data centers</dt><dd>Buildings full of servers: websites, apps, video platforms, cloud providers. Big content companies also place <b>CDN</b> (content delivery network) servers inside ISPs, so a popular video is served from a city near you instead of from another continent.</dd>
<dt>DNS (Domain Name System)</dt><dd>The internet's phone book. People remember names like <code>www.nkshop.example</code>; computers need numeric IP addresses such as <code>203.0.113.80</code>. DNS servers translate the name into the address before any connection starts.</dd>
</dl>

<h3>DNS in one paragraph</h3>
<p>When you type a name, your PC asks a <b>recursive resolver</b> (usually run by your ISP or a public DNS service). If the resolver does not already know the answer, it asks a <b>root server</b> ("who handles .example?"), then the <b>TLD server</b> for that ending ("who handles nkshop.example?"), then the domain's <b>authoritative server</b>, which gives the final answer. The resolver <b>caches</b> (remembers) the answer for a while, so the next person gets it instantly. All of this usually takes a few milliseconds.</p>

<div class="eg"><p><b>Worked example: one web page, end to end.</b></p><ol>
<li>Asha, at home in Jaipur, types <code>www.nkshop.example</code> on her laptop (address 192.168.1.23).</li>
<li>Her laptop asks the DNS resolver 198.51.100.53, which replies: 203.0.113.80.</li>
<li>The laptop sends a request to 203.0.113.80 through the home router (192.168.1.1).</li>
<li>The home router swaps her private address for its public address 198.51.100.24 (NAT) and sends it to the ISP.</li>
<li>The ISP's routers pass it to a backbone provider, which hands it to the network that hosts nkshop's data center.</li>
<li>The web server replies. The reply follows the path back, and the home router hands it to Asha's laptop.</li>
</ol><p>Total time: often under 100 milliseconds, across maybe 10 to 15 routers owned by 3 or 4 different companies.</p></div>

<h3>Client/server and peer-to-peer</h3>
<p>Every conversation on a network has roles. In the <b>client/server</b> model, a <b>client</b> (your browser, your banking app) asks for something and a <b>server</b> (a powerful computer in a data center) provides it. Servers are always on, have fixed addresses and serve many clients at once. Most of what you do daily, such as web, email, UPI and streaming, is client/server.</p>
<p>In the <b>peer-to-peer (P2P)</b> model, every device is both client and server. Devices share directly with each other, with no central server. Examples: file sharing in torrent-style applications, some video calls that connect two phones directly, and two PCs in a small office sharing folders with each other. P2P is cheap and has no single central box to fail, but it is hard to secure and manage at scale.</p>
<table class="cmp"><tr><th></th><th>Client/server</th><th>Peer-to-peer</th></tr>
<tr><td>Who provides the service</td><td>Dedicated servers</td><td>Every peer</td></tr>
<tr><td>Management and security</td><td>Central, easy to control</td><td>Spread out, harder</td></tr>
<tr><td>Scales to</td><td>Millions of users (with enough servers)</td><td>Small groups well; large swarms loosely</td></tr>
<tr><td>Example</td><td>Online banking, a company file server</td><td>Two PCs sharing a folder</td></tr>
</table>

<div class="warn"><p><b>Common beginner mistake.</b> Calling the home router "the modem" or "the Wi-Fi". In many homes one box does everything, but in offices these are separate devices: a modem or fibre terminal, a router, a firewall, switches and access points. When you troubleshoot, always ask which function is failing.</p></div>

<div class="exam"><p><b>Exam trap.</b> DNS turns names into IP addresses; it does not carry the web page itself. If a site opens by IP address but not by name, suspect DNS. If it fails by both, the problem is lower down (addressing, routing or the link).</p></div>

<div class="scn"><h4>"The internet is down" for one family only</h4><p>A family called their ISP saying the internet was down. The support engineer asked them to open a site by its IP address in the browser, and it worked. Names did not work at all. The engineer checked the home router and found someone had typed a wrong DNS server address in its settings while "trying to speed up the internet". Setting DNS back to automatic (the ISP's resolver) fixed everything in a minute.</p><p><b>Lesson:</b> "the internet is down" is a symptom, not a diagnosis. Split the path into pieces (device, home router, ISP, DNS, server) and test each one.</p></div>

<div class="iv"><p class="q">"What happens, at a high level, when you type a website name in your browser?"</p><p>Strong answer: the PC first resolves the name to an IP address using DNS (checking its cache, then asking the configured resolver). Then it sends the request to its default gateway, the home or office router, because the server is on another network. NAT may change the source address. The ISP and backbone routers forward the packet hop by hop to the server's network, the server answers, and the reply returns the same way. Mention DNS, default gateway, routers and client/server, and offer to go deeper into ARP and TCP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Internet path: device, home router, ISP access network, backbone (tier 1/2 ISPs, IXPs, sea cables), data center.</li>
<li>A home router combines router, switch, Wi-Fi AP, firewall, DHCP server and NAT.</li>
<li>DNS translates names to IP addresses: resolver, root, TLD, authoritative, with caching.</li>
<li>Client/server: dedicated servers serve many clients. Peer-to-peer: every device serves and asks.</li>
<li>Works by IP but not by name = think DNS first.</li>
</ul></div>
`,hi:`
<p>India ka road network imagine karo. Aapki gali colony road se judti hai, colony road city road se, city road national highway se, aur highways bade junctions par milte hain. Saari sadkon ka maalik koi ek nahi hai: gali colony ki hai, city roads shehar ki, aur highways national authority ke. Phir bhi ek truck aapke gate se desh ke kisi bhi address tak jaa sakta hai kyunki sab road ke same rules follow karte hain. Internet bilkul aise hi bana hai.</p>

<h3>Poori picture ek drawing mein</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Ghar se internet ke paar data center tak ka raasta">
<rect x="10" y="90" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="60" y="110" text-anchor="middle" class="svg-ink" font-size="13">Ghar ke devices</text><text x="60" y="126" text-anchor="middle" class="svg-muted" font-size="12">phone, laptop</text>
<rect x="130" y="90" width="90" height="44" rx="8" fill="#bae6fd"/><text x="175" y="110" text-anchor="middle" class="svg-ink" font-size="13">Home router</text><text x="175" y="126" text-anchor="middle" class="svg-muted" font-size="12">+ Wi-Fi</text>
<rect x="240" y="90" width="90" height="44" rx="8" fill="#fed7aa"/><text x="285" y="110" text-anchor="middle" class="svg-ink" font-size="13">Local ISP</text><text x="285" y="126" text-anchor="middle" class="svg-muted" font-size="12">access network</text>
<rect x="350" y="80" width="120" height="64" rx="8" fill="#ddd6fe"/><text x="410" y="106" text-anchor="middle" class="svg-ink" font-size="13">Backbone</text><text x="410" y="124" text-anchor="middle" class="svg-muted" font-size="12">bade ISPs, IXPs,</text><text x="410" y="138" text-anchor="middle" class="svg-muted" font-size="12">samudri cables</text>
<rect x="490" y="90" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">Data center</text><text x="560" y="126" text-anchor="middle" class="svg-muted" font-size="12">web servers</text>
<line x1="110" y1="112" x2="130" y2="112" stroke="#64748b" stroke-width="2"/><line x1="220" y1="112" x2="240" y2="112" stroke="#64748b" stroke-width="2"/><line x1="330" y1="112" x2="350" y2="112" stroke="#64748b" stroke-width="2"/><line x1="470" y1="112" x2="490" y2="112" stroke="#64748b" stroke-width="2"/>
<rect x="240" y="190" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">DNS servers</text><text x="320" y="226" text-anchor="middle" class="svg-muted" font-size="12">naam se IP lookup</text>
<line x1="175" y1="134" x2="260" y2="190" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="13">Request left se right jaati hai; reply right se left wapas aata hai</text>
</svg><p class="cap">Ghar, ISP, backbone, data center, aur side mein DNS jo batata hai "is naam ka address kya hai?"</p></div>

<h3>Tukde, aapke kamre se bahar ki taraf</h3>
<dl class="terms">
<dt>Ghar ke devices</dt><dd>Phones, laptops, smart TVs. Har ek mein network card (Wi-Fi ya Ethernet) hota hai aur har ek home router se address leta hai.</dd>
<dt>Home router</dt><dd>Internet provider ka chhota box. Yeh asal mein kai devices ek mein hai: ek router (ghar ke network ko ISP se jodta hai), ek switch (kuch LAN ports), ek Wi-Fi access point, ek basic firewall, aur ek DHCP server jo addresses baant-ta hai. Yeh NAT bhi karta hai, jisse aapke saare devices ISP ka diya ek public address share karte hain. In sab ko aap alag alag padhoge.</dd>
<dt>ISP (Internet Service Provider)</dt><dd>Woh company jise aap internet access ke paise dete ho. Aapka connection ISP tak fibre (FTTH), cable, phone line par DSL, ya mobile (4G/5G) se pahunchta hai. ISP ka <b>access network</b> hazaaron customers ko ikattha karke unka traffic apne core routers tak bhejta hai.</dd>
<dt>Backbone</dt><dd>Bade providers (jinhe aksar <b>tier 1</b> aur <b>tier 2</b> ISPs kehte hain) deshon ke paar aur samudra ke neeche bahut fast fibre networks chalate hain. Woh ek dusre se <b>IXPs</b> (Internet Exchange Points) par judte hain, aisi buildings jahan bahut saare networks shared switches mein plug karke traffic exchange karte hain, aur private links se bhi. Continents ke beech zyada tar traffic undersea cables le jaate hain.</dd>
<dt>Data centers</dt><dd>Servers se bhari buildings: websites, apps, video platforms, cloud providers. Bade content companies ISPs ke andar <b>CDN</b> (content delivery network) servers bhi lagate hain, taaki popular video dusre continent ki jagah aapke paas ke shehar se serve ho.</dd>
<dt>DNS (Domain Name System)</dt><dd>Internet ki phone book. Log <code>www.nkshop.example</code> jaise naam yaad rakhte hain; computers ko <code>203.0.113.80</code> jaise numeric IP addresses chahiye. Koi bhi connection shuru hone se pehle DNS servers naam ko address mein translate karte hain.</dd>
</dl>

<h3>DNS ek paragraph mein</h3>
<p>Jab aap naam type karte ho, aapka PC ek <b>recursive resolver</b> se poochta hai (aam taur par ISP ya public DNS service chalati hai). Agar resolver ko answer pehle se nahi pata, to woh <b>root server</b> se poochta hai (".example kaun handle karta hai?"), phir us ending ke <b>TLD server</b> se ("nkshop.example kaun handle karta hai?"), phir domain ke <b>authoritative server</b> se, jo final answer deta hai. Resolver answer ko kuch der ke liye <b>cache</b> karta hai (yaad rakhta hai), taaki agle insaan ko turant mil jaaye. Yeh sab aam taur par kuch milliseconds mein ho jaata hai.</p>

<div class="eg"><p><b>Worked example: ek web page, shuru se end tak.</b></p><ol>
<li>Asha, Jaipur mein ghar par, apne laptop (address 192.168.1.23) par <code>www.nkshop.example</code> type karti hai.</li>
<li>Uska laptop DNS resolver 198.51.100.53 se poochta hai, jo reply karta hai: 203.0.113.80.</li>
<li>Laptop home router (192.168.1.1) ke through 203.0.113.80 ko request bhejta hai.</li>
<li>Home router uske private address ko apne public address 198.51.100.24 se badal deta hai (NAT) aur ISP ko bhej deta hai.</li>
<li>ISP ke routers use backbone provider ko dete hain, jo use us network ko deta hai jo nkshop ka data center host karta hai.</li>
<li>Web server reply karta hai. Reply wahi raasta pakad kar wapas aata hai, aur home router use Asha ke laptop ko de deta hai.</li>
</ol><p>Total time: aksar 100 milliseconds se kam, shayad 10 se 15 routers ke paar jo 3 ya 4 alag companies ke hain.</p></div>

<h3>Client/server aur peer-to-peer</h3>
<p>Network par har baatcheet mein roles hote hain. <b>Client/server</b> model mein <b>client</b> (aapka browser, banking app) kuch maangta hai aur <b>server</b> (data center mein ek powerful computer) woh deta hai. Servers hamesha on rehte hain, unke fixed addresses hote hain aur woh ek saath bahut clients ko serve karte hain. Aap roz jo karte ho, jaise web, email, UPI aur streaming, zyada tar client/server hai.</p>
<p><b>Peer-to-peer (P2P)</b> model mein har device client bhi hai aur server bhi. Devices bina kisi central server ke seedhe ek dusre se share karte hain. Examples: torrent-style applications mein file sharing, kuch video calls jo do phones ko seedhe jodti hain, aur chhote office mein do PCs jo aapas mein folders share karte hain. P2P sasta hai aur koi ek central box fail hone wala nahi hota, lekin bade scale par ise secure aur manage karna mushkil hai.</p>
<table class="cmp"><tr><th></th><th>Client/server</th><th>Peer-to-peer</th></tr>
<tr><td>Service kaun deta hai</td><td>Dedicated servers</td><td>Har peer</td></tr>
<tr><td>Management aur security</td><td>Central, control karna aasaan</td><td>Faila hua, mushkil</td></tr>
<tr><td>Kitna scale karta hai</td><td>Laakhon users (kaafi servers ke saath)</td><td>Chhote groups mein accha; bade swarms loosely</td></tr>
<tr><td>Example</td><td>Online banking, company file server</td><td>Do PCs jo ek folder share karte hain</td></tr>
</table>

<div class="warn"><p><b>Beginners ki common galti.</b> Home router ko "modem" ya "Wi-Fi" kehna. Bahut gharon mein ek box sab karta hai, lekin offices mein yeh alag devices hote hain: modem ya fibre terminal, router, firewall, switches aur access points. Troubleshoot karte waqt hamesha poocho ki kaunsa function fail ho raha hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> DNS naamon ko IP addresses mein badalta hai; woh khud web page nahi le jaata. Agar site IP address se khulti hai lekin naam se nahi, to DNS par shak karo. Agar dono se fail ho, to problem neeche hai (addressing, routing ya link).</p></div>

<div class="scn"><h4>"Internet down hai" sirf ek family ke liye</h4><p>Ek family ne ISP ko call kiya ki internet down hai. Support engineer ne unse browser mein ek site uske IP address se kholne ko kaha, aur woh khul gayi. Naam bilkul kaam nahi kar rahe the. Engineer ne home router check kiya aur paaya ki kisi ne "internet fast karne" ki koshish mein uski settings mein galat DNS server address type kar diya tha. DNS ko wapas automatic (ISP ka resolver) karne se ek minute mein sab theek ho gaya.</p><p><b>Seekh:</b> "internet down hai" ek symptom hai, diagnosis nahi. Raaste ko tukdon mein baanto (device, home router, ISP, DNS, server) aur har ek ko test karo.</p></div>

<div class="iv"><p class="q">"High level par, jab aap browser mein website ka naam type karte ho to kya hota hai?"</p><p>Strong answer: PC pehle DNS se naam ko IP address mein resolve karta hai (pehle apna cache check karta hai, phir configured resolver se poochta hai). Phir woh request apne default gateway, yaani home ya office router ko bhejta hai, kyunki server dusre network par hai. NAT source address badal sakta hai. ISP aur backbone routers packet ko hop by hop server ke network tak forward karte hain, server answer karta hai, aur reply usi tarah wapas aata hai. DNS, default gateway, routers aur client/server mention karo, aur ARP aur TCP mein gehraai tak jaane ka offer do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Internet ka raasta: device, home router, ISP access network, backbone (tier 1/2 ISPs, IXPs, samudri cables), data center.</li>
<li>Home router mein router, switch, Wi-Fi AP, firewall, DHCP server aur NAT ek saath hote hain.</li>
<li>DNS naamon ko IP addresses mein translate karta hai: resolver, root, TLD, authoritative, caching ke saath.</li>
<li>Client/server: dedicated servers bahut clients ko serve karte hain. Peer-to-peer: har device serve bhi karta hai aur maangta bhi hai.</li>
<li>IP se chale lekin naam se nahi = pehle DNS socho.</li>
</ul></div>
`}};export{e as default};