var e={id:`what-you-will-learn`,h:{en:`What you will learn, the track map and the big picture`,hi:`Aap kya seekhoge, track map aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> This is the free "Start here" module of the Palo Alto Networks NGFW Engineer track. By the end you will be able to explain what makes a firewall next-generation, describe zones, App-ID and security policy in plain words, find your way around PAN-OS (candidate configuration, commit, CLI and GUI), read the first show commands, and plan how to practise for the NGFW Engineer exam in the labs. You will not configure a full firewall here. You will understand the ideas so the next modules feel familiar.</p>
<p><b>Prerequisites.</b> CCNA-level networking: IP addressing and subnets, VLANs, static routing, TCP and UDP ports, ACLs and NAT. You do not need any firewall experience and you do not need to know any Palo Alto product.</p>

<h3>Analogy: a smart reception desk</h3>
<p>Picture an office building. An old-style security guard checks only the door number you walk through: "Floor 5 is allowed, floor 9 is not." That is a traditional port-based firewall. It looks at addresses and port numbers. The problem is that a visitor can walk through the allowed door and do something completely different inside.</p>
<p>A next-generation firewall (NGFW) is a smart reception desk. It asks <b>who you are</b> (user), <b>what you are here to do</b> (application), and it can <b>look inside your bag</b> (threat scanning). The door number still matters, but it is only one clue. Palo Alto Networks built its firewall around that idea, and PAN-OS is the operating system that runs it.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Traditional versus next-generation firewall">
<rect x="20" y="20" width="270" height="130" rx="10" fill="#e2e8f0"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">Traditional firewall</text>
<text x="155" y="72" text-anchor="middle" class="svg-muted" font-size="12">source IP, destination IP</text><text x="155" y="92" text-anchor="middle" class="svg-muted" font-size="12">protocol and port number</text><text x="155" y="112" text-anchor="middle" class="svg-muted" font-size="12">"port 443 means web"</text><text x="155" y="136" text-anchor="middle" class="svg-accent" font-size="12">trusts the port</text>
<rect x="350" y="20" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">Next-generation firewall</text>
<text x="485" y="72" text-anchor="middle" class="svg-muted" font-size="12">application (App-ID)</text><text x="485" y="92" text-anchor="middle" class="svg-muted" font-size="12">user (User-ID)</text><text x="485" y="112" text-anchor="middle" class="svg-muted" font-size="12">content and threats (Content-ID)</text><text x="485" y="136" text-anchor="middle" class="svg-accent" font-size="12">trusts what it can prove</text>
<line x1="290" y1="85" x2="350" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The firewall question moves from "which port?" to "which application, which user, which content?"</p></div>

<h3>The five ideas this module builds</h3>
<ol>
<li><b>Next-generation</b>: what the three "-ID" technologies add on top of a stateful firewall (chapter 2).</li>
<li><b>Zones</b>: groups of interfaces that become the "from" and "to" of every rule (chapter 3).</li>
<li><b>Policy and App-ID</b>: how a rule is written and why rule order matters (chapter 4).</li>
<li><b>PAN-OS organisation</b>: planes, interfaces to manage the box, and the configuration tree (chapter 5).</li>
<li><b>Candidate, commit, verify</b>: the safe change workflow and the first show commands (chapters 6 to 8).</li>
</ol>

<h3>Where this module sits in the track</h3>
<p>The track follows the shape of the NGFW Engineer exam: configuration and deployment, policy and threat features, then operations and troubleshooting. Always confirm the current domains and weights in the official exam guide from Palo Alto Networks, because they are updated. In this academy the order is: this module, then <b>pan-setup</b> (CLI, commit, interfaces, zones, virtual router), <b>pan-policy</b> (App-ID and rule order), <b>pan-nat</b>, <b>pan-vlans</b> (subinterfaces and deployment modes), routing, VPN, profiles, decryption, User-ID, high availability and Panorama.</p>

<div class="eg"><p><b>Worked example.</b> A user opens a video site on TCP port 443. A port-based firewall sees "TCP 443 allowed" and passes it. A NGFW identifies the application as, say, a video streaming service running inside TLS, and your policy may allow business web but block streaming for a specific group. The port never changed. The decision did.</p></div>

<div class="note"><p><b>About the labs.</b> This module has no labs of its own. It explains the vocabulary. The command outputs you see in these chapters were captured from the NK-OS simulator, which mimics PAN-OS 11.1 behaviour but is an educational simulator, not Palo Alto software. Hands-on practice for the ideas here lives in the <b>pan-setup</b> labs (first commit, and a ticket where a DMZ interface is dead). Policy practice follows in <b>pan-policy</b>.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating a Palo Alto firewall as "a Cisco ASA with a different CLI". The ideas that matter are different: policy is written between zones, rules name applications rather than only ports, and nothing you type takes effect until you commit.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often hide the answer in one word: "application-default", "candidate", "zone". Learn the exact vocabulary now. It saves marks later.</p></div>

<div class="scn"><h4>The "we already allow 443" meeting</h4><p>A company's old firewall allowed outbound port 443 to everyone. Security noticed a file-sharing tool tunnelling through that port and moving documents out. The network team said, "But 443 is allowed, that is how the web works." After moving to a NGFW, the same port stayed open for the web applications the business needed, while the unapproved file-sharing application was blocked by name.</p><p><b>Lesson:</b> an open port is not the same as an approved application.</p></div>

<div class="iv"><p class="q">"In one sentence, what is a next-generation firewall?"</p><p>A stateful firewall that also identifies the application, the user and the content of traffic, independent of port number, so policy can be written about business intent instead of only IPs and ports. Mention App-ID, User-ID and Content-ID by name and say that policy is written between zones.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A NGFW decides using application, user and content, not only IP and port.</li>
<li>PAN-OS is the operating system of Palo Alto Networks firewalls.</li>
<li>Policy is written between zones; changes apply only after a commit.</li>
<li>This module is vocabulary and orientation; labs start in pan-setup.</li>
<li>Check the official exam guide for current domains and weights.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh Palo Alto Networks NGFW Engineer track ka free "Start here" module hai. Iske ant tak aap explain kar paoge ki firewall ko next-generation kya banata hai, zones, App-ID aur security policy saral shabdon mein describe kar paoge, PAN-OS mein apna raasta dhoondh paoge (candidate configuration, commit, CLI aur GUI), pehle show commands padh paoge, aur NGFW Engineer exam ke liye labs mein practice ka plan bana paoge. Yahan aap poora firewall configure nahi karoge. Aap ideas samjhoge taaki agle modules jaane-pehchane lagein.</p>
<p><b>Prerequisites.</b> CCNA-level networking: IP addressing aur subnets, VLANs, static routing, TCP aur UDP ports, ACLs aur NAT. Firewall ka koi experience zaroori nahi aur kisi Palo Alto product ki jaankari bhi nahi chahiye.</p>

<h3>Analogy: smart reception desk</h3>
<p>Ek office building socho. Purane zamane ka security guard sirf door number dekhta hai: "Floor 5 allowed hai, floor 9 nahi." Yeh traditional port-based firewall hai. Woh addresses aur port numbers dekhta hai. Dikkat yeh hai ki visitor allowed darwaze se andar jaakar bilkul alag kaam kar sakta hai.</p>
<p>Next-generation firewall (NGFW) ek smart reception desk hai. Woh poochta hai <b>aap kaun ho</b> (user), <b>aap yahan kya karne aaye ho</b> (application), aur woh <b>aapke bag ke andar bhi dekh sakta hai</b> (threat scanning). Door number ab bhi matter karta hai, lekin woh sirf ek clue hai. Palo Alto Networks ne apna firewall isi idea par banaya, aur PAN-OS woh operating system hai jo ise chalata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Traditional aur next-generation firewall">
<rect x="20" y="20" width="270" height="130" rx="10" fill="#e2e8f0"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">Traditional firewall</text>
<text x="155" y="72" text-anchor="middle" class="svg-muted" font-size="12">source IP, destination IP</text><text x="155" y="92" text-anchor="middle" class="svg-muted" font-size="12">protocol aur port number</text><text x="155" y="112" text-anchor="middle" class="svg-muted" font-size="12">"port 443 matlab web"</text><text x="155" y="136" text-anchor="middle" class="svg-accent" font-size="12">port par bharosa</text>
<rect x="350" y="20" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">Next-generation firewall</text>
<text x="485" y="72" text-anchor="middle" class="svg-muted" font-size="12">application (App-ID)</text><text x="485" y="92" text-anchor="middle" class="svg-muted" font-size="12">user (User-ID)</text><text x="485" y="112" text-anchor="middle" class="svg-muted" font-size="12">content aur threats (Content-ID)</text><text x="485" y="136" text-anchor="middle" class="svg-accent" font-size="12">jo saabit ho sake uspar bharosa</text>
<line x1="290" y1="85" x2="350" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Firewall ka sawal "kaunsa port?" se badalkar "kaunsi application, kaunsa user, kaunsa content?" ho jaata hai.</p></div>

<h3>Is module ke paanch ideas</h3>
<ol>
<li><b>Next-generation</b>: stateful firewall ke upar teen "-ID" technologies kya jodti hain (chapter 2).</li>
<li><b>Zones</b>: interfaces ke groups jo har rule ke "from" aur "to" bante hain (chapter 3).</li>
<li><b>Policy aur App-ID</b>: rule kaise likha jaata hai aur rule order kyun matter karta hai (chapter 4).</li>
<li><b>PAN-OS organisation</b>: planes, box ko manage karne ke interfaces, aur configuration tree (chapter 5).</li>
<li><b>Candidate, commit, verify</b>: safe change workflow aur pehle show commands (chapters 6 se 8).</li>
</ol>

<h3>Track mein yeh module kahan aata hai</h3>
<p>Track NGFW Engineer exam ke shape ko follow karta hai: configuration aur deployment, policy aur threat features, phir operations aur troubleshooting. Current domains aur weights hamesha Palo Alto Networks ki official exam guide mein confirm karo, kyunki woh update hoti rehti hain. Is academy mein order yeh hai: yeh module, phir <b>pan-setup</b> (CLI, commit, interfaces, zones, virtual router), <b>pan-policy</b> (App-ID aur rule order), <b>pan-nat</b>, <b>pan-vlans</b> (subinterfaces aur deployment modes), routing, VPN, profiles, decryption, User-ID, high availability aur Panorama.</p>

<div class="eg"><p><b>Worked example.</b> Ek user TCP port 443 par video site kholta hai. Port-based firewall "TCP 443 allowed" dekhkar pass kar deta hai. NGFW application ko pehchanta hai, maan lo TLS ke andar chalti video streaming service, aur aapki policy kisi group ke liye business web allow karke streaming block kar sakti hai. Port wahi raha. Decision badal gaya.</p></div>

<div class="note"><p><b>Labs ke baare mein.</b> Is module ke apne koi labs nahi hain. Yeh vocabulary samjhata hai. In chapters mein jo command outputs dikhte hain woh NK-OS simulator se capture kiye gaye hain, jo PAN-OS 11.1 jaisa behaviour dikhata hai lekin ek educational simulator hai, Palo Alto software nahi. Yahan ke ideas ki hands-on practice <b>pan-setup</b> labs mein hai (first commit, aur ek ticket jahan DMZ interface dead hai). Policy practice <b>pan-policy</b> mein aage aati hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Palo Alto firewall ko "Cisco ASA jaisa, bas alag CLI" samajhna. Jo ideas matter karte hain woh alag hain: policy zones ke beech likhi jaati hai, rules sirf ports nahi balki applications ke naam lete hain, aur jo bhi type karo woh commit ke baad hi lagu hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaalon mein jawab aksar ek shabd mein chhupa hota hai: "application-default", "candidate", "zone". Vocabulary abhi seekh lo. Baad mein marks bachte hain.</p></div>

<div class="scn"><h4>"Hum already 443 allow karte hain" wali meeting</h4><p>Ek company ke purane firewall ne outbound port 443 sabke liye allow kar rakha tha. Security ne dekha ki ek file-sharing tool us port se tunnel hokar documents bahar bhej raha tha. Network team ne kaha, "Par 443 allowed hai, web aise hi chalta hai." NGFW par jaane ke baad wahi port un web applications ke liye khula raha jo business ko chahiye the, jabki unapproved file-sharing application naam se block ho gayi.</p><p><b>Lesson:</b> khula port aur approved application ek cheez nahi hain.</p></div>

<div class="iv"><p class="q">"Ek sentence mein batao next-generation firewall kya hai?"</p><p>Ek stateful firewall jo traffic ki application, user aur content bhi pehchanta hai, port number se independent, taaki policy sirf IPs aur ports ki jagah business intent par likhi ja sake. App-ID, User-ID aur Content-ID ka naam lo aur kaho ki policy zones ke beech likhi jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NGFW decision application, user aur content se leta hai, sirf IP aur port se nahi.</li>
<li>PAN-OS Palo Alto Networks firewalls ka operating system hai.</li>
<li>Policy zones ke beech likhi jaati hai; changes commit ke baad hi apply hote hain.</li>
<li>Yeh module vocabulary aur orientation hai; labs pan-setup se shuru hote hain.</li>
<li>Current domains aur weights ke liye official exam guide dekho.</li>
</ul></div>
`}};export{e as default};