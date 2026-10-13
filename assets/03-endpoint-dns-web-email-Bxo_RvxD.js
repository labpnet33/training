var e={id:`endpoint-dns-web-email`,h:{en:`Endpoint, DNS, web and email security`,hi:`Endpoint, DNS, web aur email security`},body:{en:`
<p>Imagine a house. The firewall is the front door. But burglars also try the windows (email attachments), the phone line (DNS lookups to shady sites), the delivery hatch (web downloads), and sometimes they are already inside disguised as a family member (an infected laptop). Each entry point needs its own lock. This chapter covers those locks at the level ENCOR expects: what each one does and where it sits.</p>

<h3>Endpoint security: protect the device itself</h3>
<p>An <b>endpoint</b> is any device a user or process runs on: laptops, desktops, servers, phones. Classic antivirus (an <b>EPP</b>, endpoint protection platform) blocks known malware by signature. Modern threats change constantly, so endpoints also need <b>EDR</b> (endpoint detection and response): continuous recording of what processes do, so an analyst can see how an attack spread and stop it.</p>
<p><b>Cisco Secure Endpoint</b> provides both: file reputation from the cloud (using Talos verdicts), behavioural and exploit protection, <b>retrospective detection</b> (a file allowed yesterday can be quarantined today when its verdict changes), <b>device trajectory</b> (which files and hosts touched the malware) and <b>host isolation</b> (cut the laptop off the network except for the management connection). <b>Cisco Secure Client</b> (formerly AnyConnect) is the agent family on the endpoint: VPN, ISE posture, Umbrella roaming protection and the Network Visibility Module.</p>
<p>Endpoint security and the network cooperate through <b>posture</b>: ISE asks the posture agent whether the device meets policy (antivirus running, patches current, disk encrypted). A non-compliant laptop gets a remediation VLAN or ACL until it is fixed, and ISE uses CoA to reauthorize it when it becomes compliant.</p>

<h3>DNS-layer security: Cisco Umbrella</h3>
<p>Almost every connection starts with a DNS lookup, including malware calling home and phishing links. <b>Cisco Umbrella</b> (now part of the Cisco Secure Access security service edge) is a cloud recursive DNS service. When a client asks for <code>bad-domain.example</code>, Umbrella checks the domain's reputation and category and answers either with the real address or with the address of a block page. Because it acts <b>before</b> any TCP or UDP connection is made, it protects every port and protocol, on or off the corporate network (with the roaming client). For risky "grey" domains Umbrella can send only that traffic through its <b>intelligent proxy</b> for deeper inspection.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Where each security service sits">
<rect x="10" y="90" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="112" text-anchor="middle" class="svg-ink" font-size="12">Laptop</text><text x="60" y="128" text-anchor="middle" class="svg-muted" font-size="12">Secure Endpoint</text>
<rect x="160" y="20" width="130" height="40" rx="8" fill="#fde68a"/><text x="225" y="45" text-anchor="middle" class="svg-ink" font-size="12">Umbrella DNS</text>
<rect x="160" y="95" width="130" height="40" rx="8" fill="#bae6fd"/><text x="225" y="120" text-anchor="middle" class="svg-ink" font-size="12">Web proxy</text>
<rect x="340" y="95" width="120" height="40" rx="8" fill="#fed7aa"/><text x="400" y="120" text-anchor="middle" class="svg-ink" font-size="12">NGFW</text>
<rect x="510" y="95" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="570" y="120" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="340" y="175" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="400" y="200" text-anchor="middle" class="svg-ink" font-size="12">Email gateway</text>
<rect x="160" y="175" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="225" y="200" text-anchor="middle" class="svg-ink" font-size="12">Mail server</text>
<line x1="110" y1="105" x2="160" y2="45" stroke="#64748b"/><line x1="110" y1="115" x2="160" y2="115" stroke="#64748b"/><line x1="290" y1="115" x2="340" y2="115" stroke="#64748b"/><line x1="460" y1="115" x2="510" y2="115" stroke="#64748b"/>
<line x1="570" y1="135" x2="460" y2="195" stroke="#64748b"/><line x1="340" y1="195" x2="290" y2="195" stroke="#64748b"/>
<text x="480" y="45" text-anchor="middle" class="svg-muted" font-size="12">NetFlow from all switches</text><text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">to flow analytics</text>
</svg><p class="cap">DNS is checked first, web traffic can pass a proxy, the NGFW guards the edge, and inbound mail passes the email gateway before the mail server.</p></div>

<h3>Web security: Secure Web Appliance</h3>
<p>The <b>Cisco Secure Web Appliance</b> (formerly WSA) is a web proxy. Browsers reach it explicitly (proxy settings or a PAC file) or transparently (the router redirects web traffic to it with WCCP). It applies URL category filtering, web reputation, application visibility (allow a social network but block its games), anti-malware scanning of downloads, and data loss prevention on uploads. Cloud-delivered alternatives in Secure Access do the same job for remote users.</p>

<h3>Email security: Secure Email Gateway</h3>
<p>Email is still the number one delivery method for phishing and ransomware. The <b>Cisco Secure Email Gateway</b> (formerly ESA) sits in front of the mail servers: the domain's MX record points to it. It filters spam with sender reputation from Talos, checks SPF, DKIM and DMARC to catch spoofed senders, scans attachments with anti-malware and sandboxing, rewrites suspicious URLs so they are checked when clicked, applies <b>outbreak filters</b> for brand-new campaigns, and can encrypt or block outbound mail containing sensitive data.</p>

<h3>Visibility inside the network: flow analytics</h3>
<p>Firewalls see the edge; they rarely see traffic between two hosts in the campus. <b>Cisco Secure Network Analytics</b> (formerly Stealthwatch) collects NetFlow or IPFIX from switches and routers, builds a baseline of normal behaviour for each host, and alarms on anomalies such as internal scanning, a host suddenly talking to hundreds of peers, or large uploads at night. Exporting flows is plain IOS XE configuration:</p>
<pre class="code"><span class="c">! send flow records from SW1 to a flow collector</span>
SW1(config)# flow exporter SNA
SW1(config-flow-exporter)# destination 10.99.99.20
SW1(config-flow-exporter)# transport udp 2055
SW1(config)# flow monitor SNA-MON
SW1(config-flow-monitor)# exporter SNA
SW1(config-flow-monitor)# record netflow ipv4 original-input
SW1(config)# interface vlan 20
SW1(config-if)# ip flow monitor SNA-MON input</pre>
<p>NetFlow configuration is taught in depth in the <b>encor-assurance</b> module; here the point is its security value.</p>

<div class="eg"><p><b>Worked example.</b> A phishing email with a link to <code>login-update.example</code> reaches 300 staff. The email gateway rewrites the link. Twelve users click it from home, where Umbrella's roaming client resolves the domain, sees it was classified as phishing ten minutes ago, and returns a block page. One user had already clicked before the classification, so Secure Endpoint's retrospective alert and the Umbrella log together give the SOC the exact host and time to investigate.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deploying Umbrella but leaving clients free to use any DNS server. Malware simply queries a public resolver directly. Block outbound TCP and UDP 53 at the firewall except from your own resolvers or Umbrella, so DNS security cannot be bypassed.</p></div>

<div class="exam"><p><b>Exam trap.</b> DNS-layer security blocks <i>before</i> a connection exists and covers all ports; a web proxy only sees web traffic that is sent to it. EPP prevents known threats; EDR records behaviour to detect and respond. Do not mix up these pairs.</p></div>

<div class="scn"><h4>Ransomware that never started</h4><p>A branch user opened a malicious attachment on a laptop that was off the VPN. The dropper tried to resolve its command-and-control domain to download the encryption payload. Umbrella's roaming protection returned a block page address, so the download never happened. Secure Endpoint flagged the dropper's behaviour, quarantined it, and the device trajectory showed no other host had received the file.</p><p><b>Lesson:</b> layers overlap on purpose. DNS security stopped the second stage even though the first stage got through.</p></div>

<div class="iv"><p class="q">"Where does DNS-layer security fit, and why is it effective?"</p><p>Strong answer: it is the first check in almost every connection. The resolver refuses to give the address of malicious or unwanted domains, so the connection is never made, on any port, and it works off-network with a roaming agent. It is cheap, has no latency cost for normal traffic and catches command-and-control callbacks. Mention that you must block direct outbound DNS so clients cannot bypass it, and that risky domains can be proxied for deeper inspection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Secure Endpoint: EPP plus EDR, retrospective detection, device trajectory and host isolation.</li>
<li>Posture lets ISE restrict non-compliant endpoints and reauthorize them with CoA once fixed.</li>
<li>Umbrella blocks at the DNS layer before any connection, on every port, on or off network.</li>
<li>Secure Web Appliance = web proxy; Secure Email Gateway = MX-facing filter with SPF/DKIM/DMARC and sandboxing.</li>
<li>NetFlow-based analytics gives visibility into east-west traffic the edge firewall never sees.</li>
</ul></div>
`,hi:`
<p>Ek ghar ki kalpana karo. Firewall front door hai. Lekin chor khidkiyon (email attachments), phone line (sandigdh sites ke DNS lookups), delivery hatch (web downloads) ko bhi try karte hain, aur kabhi kabhi woh pehle se andar hote hain family member ke bhes mein (infected laptop). Har entry point ko apna taala chahiye. Yeh chapter un taalon ko us level par cover karta hai jo ENCOR expect karta hai: har ek kya karta hai aur kahan baithta hai.</p>

<h3>Endpoint security: device ko khud bachao</h3>
<p><b>Endpoint</b> koi bhi device hai jis par user ya process chalta hai: laptops, desktops, servers, phones. Classic antivirus (<b>EPP</b>, endpoint protection platform) known malware ko signature se block karta hai. Modern threats lagataar badalte hain, isliye endpoints ko <b>EDR</b> (endpoint detection and response) bhi chahiye: processes kya karte hain uski continuous recording, taaki analyst dekh sake ki attack kaise faila aur use rok sake.</p>
<p><b>Cisco Secure Endpoint</b> dono deta hai: cloud se file reputation (Talos verdicts use karke), behavioural aur exploit protection, <b>retrospective detection</b> (kal allow hui file aaj quarantine ho sakti hai jab uska verdict badle), <b>device trajectory</b> (kin files aur hosts ne malware ko chhua) aur <b>host isolation</b> (laptop ko management connection ke alawa network se kaat do). <b>Cisco Secure Client</b> (pehle AnyConnect) endpoint par agent family hai: VPN, ISE posture, Umbrella roaming protection aur Network Visibility Module.</p>
<p>Endpoint security aur network <b>posture</b> ke through saath kaam karte hain: ISE posture agent se poochta hai ki device policy meet karta hai ya nahi (antivirus chal raha hai, patches current hain, disk encrypted hai). Non-compliant laptop ko fix hone tak remediation VLAN ya ACL milta hai, aur compliant hone par ISE CoA se use reauthorize karta hai.</p>

<h3>DNS-layer security: Cisco Umbrella</h3>
<p>Lagbhag har connection DNS lookup se shuru hota hai, malware ka ghar call karna aur phishing links bhi. <b>Cisco Umbrella</b> (ab Cisco Secure Access security service edge ka hissa) ek cloud recursive DNS service hai. Jab client <code>bad-domain.example</code> maangta hai, Umbrella domain ki reputation aur category check karta hai aur ya to asli address deta hai ya block page ka address. Kyunki yeh koi bhi TCP ya UDP connection banne se <b>pehle</b> kaam karta hai, yeh har port aur protocol ko protect karta hai, corporate network par ho ya bahar (roaming client ke saath). Risky "grey" domains ke liye Umbrella sirf us traffic ko deeper inspection ke liye apne <b>intelligent proxy</b> se bhej sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Har security service kahan baithti hai">
<rect x="10" y="90" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="112" text-anchor="middle" class="svg-ink" font-size="12">Laptop</text><text x="60" y="128" text-anchor="middle" class="svg-muted" font-size="12">Secure Endpoint</text>
<rect x="160" y="20" width="130" height="40" rx="8" fill="#fde68a"/><text x="225" y="45" text-anchor="middle" class="svg-ink" font-size="12">Umbrella DNS</text>
<rect x="160" y="95" width="130" height="40" rx="8" fill="#bae6fd"/><text x="225" y="120" text-anchor="middle" class="svg-ink" font-size="12">Web proxy</text>
<rect x="340" y="95" width="120" height="40" rx="8" fill="#fed7aa"/><text x="400" y="120" text-anchor="middle" class="svg-ink" font-size="12">NGFW</text>
<rect x="510" y="95" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="570" y="120" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="340" y="175" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="400" y="200" text-anchor="middle" class="svg-ink" font-size="12">Email gateway</text>
<rect x="160" y="175" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="225" y="200" text-anchor="middle" class="svg-ink" font-size="12">Mail server</text>
<line x1="110" y1="105" x2="160" y2="45" stroke="#64748b"/><line x1="110" y1="115" x2="160" y2="115" stroke="#64748b"/><line x1="290" y1="115" x2="340" y2="115" stroke="#64748b"/><line x1="460" y1="115" x2="510" y2="115" stroke="#64748b"/>
<line x1="570" y1="135" x2="460" y2="195" stroke="#64748b"/><line x1="340" y1="195" x2="290" y2="195" stroke="#64748b"/>
<text x="480" y="45" text-anchor="middle" class="svg-muted" font-size="12">Sabhi switches se NetFlow</text><text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">flow analytics tak</text>
</svg><p class="cap">DNS pehle check hota hai, web traffic proxy se guzar sakta hai, NGFW edge ki raksha karta hai, aur inbound mail mail server se pehle email gateway se guzarta hai.</p></div>

<h3>Web security: Secure Web Appliance</h3>
<p><b>Cisco Secure Web Appliance</b> (pehle WSA) ek web proxy hai. Browsers ise explicitly (proxy settings ya PAC file) ya transparently (router web traffic ko WCCP se ise redirect karta hai) reach karte hain. Yeh URL category filtering, web reputation, application visibility (social network allow lekin uske games block), downloads ki anti-malware scanning, aur uploads par data loss prevention apply karta hai. Secure Access ke cloud-delivered alternatives remote users ke liye yahi kaam karte hain.</p>

<h3>Email security: Secure Email Gateway</h3>
<p>Email abhi bhi phishing aur ransomware ka number one delivery method hai. <b>Cisco Secure Email Gateway</b> (pehle ESA) mail servers ke aage baithta hai: domain ka MX record isi ko point karta hai. Yeh Talos ki sender reputation se spam filter karta hai, spoofed senders pakadne ke liye SPF, DKIM aur DMARC check karta hai, attachments ko anti-malware aur sandboxing se scan karta hai, suspicious URLs ko rewrite karta hai taaki click par check hon, bilkul naye campaigns ke liye <b>outbreak filters</b> lagata hai, aur sensitive data wale outbound mail ko encrypt ya block kar sakta hai.</p>

<h3>Network ke andar visibility: flow analytics</h3>
<p>Firewalls edge dekhte hain; campus ke do hosts ke beech ka traffic woh shayad hi dekhte hain. <b>Cisco Secure Network Analytics</b> (pehle Stealthwatch) switches aur routers se NetFlow ya IPFIX collect karta hai, har host ke normal behaviour ka baseline banata hai, aur anomalies par alarm deta hai jaise internal scanning, host ka achanak sainkdon peers se baat karna, ya raat mein bade uploads. Flows export karna simple IOS XE configuration hai:</p>
<pre class="code"><span class="c">! SW1 se flow records flow collector ko bhejo</span>
SW1(config)# flow exporter SNA
SW1(config-flow-exporter)# destination 10.99.99.20
SW1(config-flow-exporter)# transport udp 2055
SW1(config)# flow monitor SNA-MON
SW1(config-flow-monitor)# exporter SNA
SW1(config-flow-monitor)# record netflow ipv4 original-input
SW1(config)# interface vlan 20
SW1(config-if)# ip flow monitor SNA-MON input</pre>
<p>NetFlow configuration <b>encor-assurance</b> module mein detail mein sikhaya jaata hai; yahan point uski security value hai.</p>

<div class="eg"><p><b>Worked example.</b> <code>login-update.example</code> ke link wala phishing email 300 staff tak pahunchta hai. Email gateway link rewrite karta hai. Baarah users ghar se click karte hain, jahan Umbrella ka roaming client domain resolve karta hai, dekhta hai ki das minute pehle ise phishing classify kiya gaya tha, aur block page return karta hai. Ek user ne classification se pehle hi click kar diya tha, isliye Secure Endpoint ka retrospective alert aur Umbrella log milkar SOC ko investigate karne ke liye exact host aur time dete hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Umbrella deploy karna lekin clients ko koi bhi DNS server use karne ki azaadi dena. Malware seedha public resolver se query kar leta hai. Firewall par apne resolvers ya Umbrella ke alawa outbound TCP aur UDP 53 block karo, taaki DNS security bypass na ho sake.</p></div>

<div class="exam"><p><b>Exam trap.</b> DNS-layer security connection banne se <i>pehle</i> block karti hai aur saare ports cover karti hai; web proxy sirf woh web traffic dekhta hai jo use bheja jaata hai. EPP known threats rokta hai; EDR detect aur respond karne ke liye behaviour record karta hai. In pairs ko mix mat karo.</p></div>

<div class="scn"><h4>Ransomware jo kabhi shuru nahi hua</h4><p>Ek branch user ne VPN se bahar wale laptop par malicious attachment khola. Dropper ne encryption payload download karne ke liye apna command-and-control domain resolve karne ki koshish ki. Umbrella ki roaming protection ne block page ka address diya, isliye download kabhi hua hi nahi. Secure Endpoint ne dropper ka behaviour flag karke use quarantine kiya, aur device trajectory ne dikhaya ki kisi aur host ko woh file nahi mili thi.</p><p><b>Seekh:</b> layers jaan-boojh kar overlap karti hain. First stage nikal gaya tab bhi DNS security ne second stage rok diya.</p></div>

<div class="iv"><p class="q">"DNS-layer security kahan fit hoti hai, aur yeh effective kyun hai?"</p><p>Strong answer: yeh lagbhag har connection ka pehla check hai. Resolver malicious ya unwanted domains ka address dene se mana kar deta hai, isliye connection kabhi banta hi nahi, kisi bhi port par, aur roaming agent ke saath yeh network ke bahar bhi kaam karta hai. Yeh sasta hai, normal traffic par latency cost nahi hai aur command-and-control callbacks pakadta hai. Mention karo ki direct outbound DNS block karna zaroori hai taaki clients ise bypass na karein, aur risky domains ko deeper inspection ke liye proxy kiya ja sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Secure Endpoint: EPP plus EDR, retrospective detection, device trajectory aur host isolation.</li>
<li>Posture se ISE non-compliant endpoints ko restrict karta hai aur fix hone par CoA se reauthorize karta hai.</li>
<li>Umbrella DNS layer par kisi bhi connection se pehle block karta hai, har port par, network par ho ya bahar.</li>
<li>Secure Web Appliance = web proxy; Secure Email Gateway = MX-facing filter jo SPF/DKIM/DMARC aur sandboxing karta hai.</li>
<li>NetFlow-based analytics us east-west traffic ki visibility deta hai jo edge firewall kabhi nahi dekhta.</li>
</ul></div>
`}};export{e as default};