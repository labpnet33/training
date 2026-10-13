var e={id:`roaming-dns`,h:{en:`Roaming users with Secure Client, and DNS-layer security`,hi:`Secure Client ke saath roaming users, aur DNS-layer security`},body:{en:`
<p>Before you visit any place you look up its address. If a friend who knows the city answers "do not go there, that street is unsafe" before you even leave home, you never get into trouble. <b>DNS-layer security</b> is that friend: every lookup goes to Secure Access, and a dangerous name gets a safe answer before a single packet goes to the attacker. <b>Secure Client</b> makes sure the laptop asks that friend from every network, not just from the office.</p>

<h3>What the roaming module does on the laptop</h3>
<p>Cisco Secure Client is one installer with several modules. For internet security on a roaming laptop the relevant one is the <b>internet security (roaming) module</b>, historically called the Umbrella module. Once installed with the organization profile <code>orginfo.json</code> it:</p>
<ul>
<li><b>Captures DNS on the endpoint</b> and forwards it, encrypted, to the Secure Access resolvers 208.67.222.222 and 208.67.220.220, adding the organization and device identity so policy and logs know who asked.</li>
<li><b>Steers web traffic</b> (HTTP and HTTPS) to the secure web gateway, so URL, file and data controls apply at home, in a hotel or on a mobile hotspot.</li>
<li><b>Reports the user</b> when the person has signed in, so rules by user and group work for roaming devices.</li>
</ul>
<p>In the console, <b>Connect, End User Connectivity</b> has two switches: <b>Internet Security (Secure Client)</b> to steer DNS and web traffic, and <b>Zero Trust Access (client-based)</b> for private apps (chapter 9). The <b>Roaming computers</b> table lists each computer with status, user, Zero Trust state, version and posture.</p>

<h3>Lab walk-through: protect ROAM1</h3>
<p>In the onboarding lab, Internet Security starts <b>disabled</b>. If you install the client first, it registers but does not steer traffic:</p>
<pre class="out">ROAM1&gt; secure-access status
Cisco Secure Client 5.1.8.105 — Secure Access
  Organization      : Network Kings (8195126)
  Internet security : <span class="hl">Unprotected — Internet Security is disabled for roaming devices</span></pre>
<p>Turn on <b>Internet Security</b> in End User Connectivity, then:</p>
<pre class="code">ROAM1&gt; secure-access install
ROAM1&gt; secure-access status</pre>
<pre class="out">Installing Cisco Secure Client 5.1.8.105 ...
  + Core VPN / Secure Access module
  + Umbrella roaming security (DNS) and SWG agent
  + Zero Trust Access module
Reading org profile orginfo.json (organization 8195126, Network Kings)
Registered as roaming computer ROAM1.

Cisco Secure Client 5.1.8.105 — Secure Access
  Organization      : Network Kings (8195126)
  Internet security : <span class="hl">Protected — DNS and web through Secure Access (Asia Pacific (Mumbai), 146.112.0.10)</span>
  User              : not signed in</pre>
<p>Because nobody has signed in, the identity in the logs is the <b>computer name ROAM1</b>. Later labs use laptops where a user is signed in, and the identity becomes the user, for example vikram.singh@nwkings.example.</p>

<h3>How DNS-layer security decides</h3>
<p>Every query is checked against Cisco Talos intelligence. The <b>security profile</b> attached to the matching rule lists the <b>security categories</b> to block. In the lab console they are: <b>Malware, Phishing, Command and Control, Cryptomining, Newly Seen Domains, DNS Tunneling VPN, Potentially Harmful</b>. A blocked name is answered with a Secure Access <b>block-page address</b> in 146.112.61.0/24 instead of the real IP. A browser that follows it gets a block page; malware that follows it reaches nothing useful.</p>
<pre class="out">ROAM1&gt; nslookup free-codec-update.example
Server:		208.67.222.222
Address:	208.67.222.222#53

Non-authoritative answer:
Name:	free-codec-update.example
Address: <span class="hl">146.112.61.107</span></pre>
<p>In this lab, security blocks answer 146.112.61.107, phishing blocks answer 146.112.61.108 and policy (content) blocks answer 146.112.61.104. In <b>Monitor, Activity Search</b> the event shows identity ROAM1, type DNS, action Blocked, rule Default Internet Access, reason <b>Security: Malware</b>. The default rule allowed the category, but its security profile blocked the threat.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="DNS-layer security flow">
<rect x="10" y="80" width="110" height="44" rx="8" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="12">ROAM1</text><text x="65" y="116" text-anchor="middle" class="svg-muted" font-size="11">Secure Client</text>
<rect x="210" y="70" width="170" height="64" rx="8" fill="#ddd6fe"/><text x="295" y="95" text-anchor="middle" class="svg-ink" font-size="12">Resolver 208.67.222.222</text><text x="295" y="115" text-anchor="middle" class="svg-muted" font-size="11">policy + Talos intel</text>
<rect x="470" y="20" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="550" y="47" text-anchor="middle" class="svg-ink" font-size="12">Safe: real IP</text>
<rect x="470" y="140" width="160" height="44" rx="8" fill="#fed7aa"/><text x="550" y="160" text-anchor="middle" class="svg-ink" font-size="12">Threat: 146.112.61.107</text><text x="550" y="176" text-anchor="middle" class="svg-muted" font-size="11">block page</text>
<line x1="120" y1="102" x2="210" y2="102" stroke="#64748b" stroke-width="2"/><text x="165" y="94" text-anchor="middle" class="svg-muted" font-size="11">query</text>
<line x1="380" y1="90" x2="470" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="115" x2="470" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The decision happens at name resolution, before any connection, for any port or protocol.</p></div>

<h3>Why DNS first, and what it cannot do</h3>
<p>DNS inspection is cheap, works for every protocol (a beacon over TCP 8443 still needs a name), and stops command-and-control call-backs before they connect. But it has limits: malware that connects <b>directly to an IP address</b> never asks DNS; a browser using its own <b>DNS over HTTPS</b> provider bypasses the laptop's resolver unless you block those providers; and a domain can be benign while one URL on it is malicious. That is why the SWG (next chapter) and the cloud firewall complete the picture.</p>

<div class="eg"><p><b>Worked example.</b> A 2,000-user company resolves about 3 million names a day. Blocking at DNS, the 4,000 daily hits on malware, phishing and C2 domains never produce a TCP connection, so the proxy and firewall never need to process them. Newly Seen Domains (names first seen in the last day or so) adds roughly 0.5% more blocks; turn it on for high-risk groups first and watch for false positives.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Installing Secure Client but leaving Internet Security disabled for roaming devices. Testing with <code>nslookup name 8.8.8.8</code>, which bypasses the client's DNS path on many systems. Treating the 146.112.61.x answer as an outage; it is the policy working.</p></div>

<div class="exam"><p><b>Exam traps.</b> DNS-layer security is enforced <b>before</b> the connection and is <b>protocol-agnostic</b>. It does not need HTTPS decryption. It cannot see URLs or file content. Direct-to-IP traffic needs the SWG or cloud firewall.</p></div>

<div class="scn"><h4>The codec that never downloaded</h4><p>A marketing intern on home Wi-Fi clicked a pop-up saying her video player needed a codec. Nothing happened. The next morning the SOC saw a Blocked DNS event for free-codec-update.example with reason Security: Malware and identity of her laptop. Investigate showed the domain was two days old and hosted a fake-codec dropper. Because the laptop never connected, there was nothing to clean up; the SOC only reminded her about pop-ups.</p><p><b>Lesson:</b> DNS-layer security protects roaming users on any network, and the cheapest incident is the connection that never happened.</p></div>

<div class="iv"><p class="q">"How does DNS-layer security protect a laptop at home, and what are its limits?"</p><p>Strong answer: Secure Client's roaming module sends every DNS query to the Secure Access resolvers with the device and user identity; the security profile blocks categories such as Malware, Phishing and C2 by answering with a block-page address, so no connection is made, for any protocol. Limits: direct-IP connections, browser DoH, and URL or file level threats on otherwise good domains; the SWG and cloud firewall cover those.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Secure Client's roaming module steers DNS and web traffic to Secure Access from any network.</li>
<li>End User Connectivity must have Internet Security enabled for roaming devices.</li>
<li>Blocked names resolve to block-page addresses in 146.112.61.0/24.</li>
<li>Security categories live in the security profile used by the matching rule.</li>
<li>DNS security is protocol-agnostic but blind to direct-IP traffic and URLs.</li>
</ul></div>
`,hi:`
<p>Kisi jagah jaane se pehle aap uska address dekhte ho. Agar koi dost jo shehar jaanta hai, aapke ghar se nikalne se pehle hi bol de "wahan mat jao, woh gali safe nahi hai", to aap kabhi musibat mein nahi padte. <b>DNS-layer security</b> wahi dost hai: har lookup Secure Access ke paas jaata hai, aur khatarnak naam ko attacker tak ek bhi packet jaane se pehle safe jawab milta hai. <b>Secure Client</b> yeh pakka karta hai ki laptop har network se, sirf office se nahi, usi dost se pooche.</p>

<h3>Roaming module laptop par kya karta hai</h3>
<p>Cisco Secure Client ek installer hai jismein kai modules hain. Roaming laptop ki internet security ke liye relevant module hai <b>internet security (roaming) module</b>, jise pehle Umbrella module kehte the. Organization profile <code>orginfo.json</code> ke saath install hone ke baad yeh:</p>
<ul>
<li><b>Endpoint par DNS capture karta hai</b> aur use encrypted form mein Secure Access resolvers 208.67.222.222 aur 208.67.220.220 tak forward karta hai, organization aur device identity jodkar taaki policy aur logs ko pata ho ki kisne poocha.</li>
<li><b>Web traffic steer karta hai</b> (HTTP aur HTTPS) secure web gateway tak, taaki URL, file aur data controls ghar, hotel ya mobile hotspot par bhi lagein.</li>
<li><b>User report karta hai</b> jab insaan sign in kar chuka ho, taaki roaming devices ke liye user aur group wale rules kaam karein.</li>
</ul>
<p>Console mein <b>Connect, End User Connectivity</b> par do switches hain: DNS aur web traffic steer karne ke liye <b>Internet Security (Secure Client)</b>, aur private apps ke liye <b>Zero Trust Access (client-based)</b> (chapter 9). <b>Roaming computers</b> table har computer ko status, user, Zero Trust state, version aur posture ke saath dikhati hai.</p>

<h3>Lab walk-through: ROAM1 ko protect karo</h3>
<p>Onboarding lab mein Internet Security <b>disabled</b> se shuru hota hai. Agar aap pehle client install karo, to woh register to hota hai par traffic steer nahi karta:</p>
<pre class="out">ROAM1&gt; secure-access status
Cisco Secure Client 5.1.8.105 — Secure Access
  Organization      : Network Kings (8195126)
  Internet security : <span class="hl">Unprotected — Internet Security is disabled for roaming devices</span></pre>
<p>End User Connectivity mein <b>Internet Security</b> on karo, phir:</p>
<pre class="code">ROAM1&gt; secure-access install
ROAM1&gt; secure-access status</pre>
<pre class="out">Installing Cisco Secure Client 5.1.8.105 ...
  + Core VPN / Secure Access module
  + Umbrella roaming security (DNS) and SWG agent
  + Zero Trust Access module
Reading org profile orginfo.json (organization 8195126, Network Kings)
Registered as roaming computer ROAM1.

Cisco Secure Client 5.1.8.105 — Secure Access
  Organization      : Network Kings (8195126)
  Internet security : <span class="hl">Protected — DNS and web through Secure Access (Asia Pacific (Mumbai), 146.112.0.10)</span>
  User              : not signed in</pre>
<p>Kyunki kisi ne sign in nahi kiya, logs mein identity <b>computer name ROAM1</b> hai. Baad ki labs mein aise laptops hain jahan user signed in hai, aur identity user ban jaati hai, jaise vikram.singh@nwkings.example.</p>

<h3>DNS-layer security kaise decide karta hai</h3>
<p>Har query Cisco Talos intelligence ke against check hoti hai. Matching rule se juda <b>security profile</b> block karne wali <b>security categories</b> list karta hai. Lab console mein yeh hain: <b>Malware, Phishing, Command and Control, Cryptomining, Newly Seen Domains, DNS Tunneling VPN, Potentially Harmful</b>. Blocked naam ka jawab asli IP ki jagah 146.112.61.0/24 ke ek Secure Access <b>block-page address</b> se aata hai. Browser jo use follow kare use block page milta hai; malware jo use follow kare woh kisi kaam ki cheez tak nahi pahunchta.</p>
<pre class="out">ROAM1&gt; nslookup free-codec-update.example
Server:		208.67.222.222
Address:	208.67.222.222#53

Non-authoritative answer:
Name:	free-codec-update.example
Address: <span class="hl">146.112.61.107</span></pre>
<p>Is lab mein security blocks 146.112.61.107, phishing blocks 146.112.61.108 aur policy (content) blocks 146.112.61.104 se jawab dete hain. <b>Monitor, Activity Search</b> mein event identity ROAM1, type DNS, action Blocked, rule Default Internet Access, reason <b>Security: Malware</b> dikhata hai. Default rule ne category allow ki, par uske security profile ne threat block kiya.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="DNS-layer security flow">
<rect x="10" y="80" width="110" height="44" rx="8" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="12">ROAM1</text><text x="65" y="116" text-anchor="middle" class="svg-muted" font-size="11">Secure Client</text>
<rect x="210" y="70" width="170" height="64" rx="8" fill="#ddd6fe"/><text x="295" y="95" text-anchor="middle" class="svg-ink" font-size="12">Resolver 208.67.222.222</text><text x="295" y="115" text-anchor="middle" class="svg-muted" font-size="11">policy + Talos intel</text>
<rect x="470" y="20" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="550" y="47" text-anchor="middle" class="svg-ink" font-size="12">Safe: asli IP</text>
<rect x="470" y="140" width="160" height="44" rx="8" fill="#fed7aa"/><text x="550" y="160" text-anchor="middle" class="svg-ink" font-size="12">Threat: 146.112.61.107</text><text x="550" y="176" text-anchor="middle" class="svg-muted" font-size="11">block page</text>
<line x1="120" y1="102" x2="210" y2="102" stroke="#64748b" stroke-width="2"/><text x="165" y="94" text-anchor="middle" class="svg-muted" font-size="11">query</text>
<line x1="380" y1="90" x2="470" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="115" x2="470" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Decision name resolution par hota hai, kisi bhi connection se pehle, kisi bhi port ya protocol ke liye.</p></div>

<h3>DNS pehle kyun, aur yeh kya nahi kar sakta</h3>
<p>DNS inspection sasta hai, har protocol ke liye kaam karta hai (TCP 8443 par beacon ko bhi naam chahiye), aur command-and-control call-backs ko connect hone se pehle rokta hai. Par iski limits hain: jo malware <b>seedha IP address se connect</b> karta hai woh DNS se poochta hi nahi; apna <b>DNS over HTTPS</b> provider use karne wala browser laptop ke resolver ko bypass karta hai jab tak aap un providers ko block na karo; aur ek domain benign ho sakta hai jabki uska ek URL malicious ho. Isiliye SWG (agla chapter) aur cloud firewall picture poori karte hain.</p>

<div class="eg"><p><b>Worked example.</b> 2,000 users wali company din mein lagbhag 3 million naam resolve karti hai. DNS par block karne se malware, phishing aur C2 domains ke 4,000 daily hits kabhi TCP connection nahi banate, isliye proxy aur firewall ko unhe process hi nahi karna padta. Newly Seen Domains (pichhle ek din ke aaspaas pehli baar dikhe naam) lagbhag 0.5% aur blocks jodta hai; ise pehle high-risk groups ke liye on karo aur false positives dekho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Secure Client install karna par roaming devices ke liye Internet Security disabled chhodna. <code>nslookup name 8.8.8.8</code> se test karna, jo kai systems par client ka DNS path bypass karta hai. 146.112.61.x jawab ko outage samajhna; yeh policy kaam kar rahi hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> DNS-layer security connection se <b>pehle</b> enforce hoti hai aur <b>protocol-agnostic</b> hai. Ise HTTPS decryption nahi chahiye. Yeh URLs ya file content nahi dekh sakti. Direct-to-IP traffic ke liye SWG ya cloud firewall chahiye.</p></div>

<div class="scn"><h4>Woh codec jo kabhi download nahi hua</h4><p>Ghar ke Wi-Fi par ek marketing intern ne ek pop-up click kiya jo keh raha tha ki uske video player ko codec chahiye. Kuch nahi hua. Agli subah SOC ne free-codec-update.example ka Blocked DNS event dekha, reason Security: Malware aur identity uska laptop. Investigate ne dikhaya ki domain do din purana tha aur fake-codec dropper host karta tha. Laptop ne kabhi connect hi nahi kiya, isliye saaf karne ko kuch nahi tha; SOC ne bas use pop-ups ke baare mein yaad dilaya.</p><p><b>Seekh:</b> DNS-layer security roaming users ko kisi bhi network par protect karti hai, aur sabse sasta incident woh connection hai jo kabhi hua hi nahi.</p></div>

<div class="iv"><p class="q">"DNS-layer security ghar par laptop ko kaise protect karti hai, aur iski limits kya hain?"</p><p>Strong answer: Secure Client ka roaming module har DNS query device aur user identity ke saath Secure Access resolvers ko bhejta hai; security profile Malware, Phishing aur C2 jaisi categories ko block-page address se jawab dekar block karta hai, isliye koi connection nahi banta, kisi bhi protocol ke liye. Limits: direct-IP connections, browser DoH, aur achhe domains par URL ya file level threats; inhe SWG aur cloud firewall cover karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Secure Client ka roaming module kisi bhi network se DNS aur web traffic Secure Access tak steer karta hai.</li>
<li>End User Connectivity mein roaming devices ke liye Internet Security enabled hona chahiye.</li>
<li>Blocked naam 146.112.61.0/24 ke block-page addresses par resolve hote hain.</li>
<li>Security categories matching rule ke security profile mein hoti hain.</li>
<li>DNS security protocol-agnostic hai par direct-IP traffic aur URLs ke liye andhi hai.</li>
</ul></div>
`}};export{e as default};