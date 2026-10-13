var e={id:`big-picture`,h:{en:`Wireless LANs: the big picture`,hi:`Wireless LANs: badi tasveer`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to pick the right 802.11 standard and frequency band for a site, plan channels and channel widths without overlap, explain SSID, BSSID and ESSID, choose between infrastructure, mesh, ad hoc and point-to-point designs, pick antennas, compare autonomous and lightweight access points, secure a WLAN with WPA2 or WPA3 using a pre-shared key or 802.1X, build a guest network with a captive portal, and troubleshoot the classic wireless faults: interference, channel overlap, weak signal, poor coverage, disassociation and roaming problems. You will also plan channels for a real office floor on a live controller in the lab.</p>
<p><b>Prerequisites.</b> You should know what a VLAN and a trunk are (module <i>VLANs, trunks and inter-VLAN routing</i>), how IP addressing and a default gateway work, and the OSI layers. No radio background is needed; we build it from zero.</p>

<h3>An analogy: a conference hall full of conversations</h3>
<p>Picture a large conference hall. At each table a group of people talk. Everyone shares the same air, so only one person at a table can speak at a time, and if two tables are too close and speak on the same "topic", they drown each other out. A good event planner spreads the tables out, gives neighbouring tables different topics, tells loud speakers to lower their voices, and puts a host at the door who checks invitations.</p>
<p>A <b>wireless LAN (WLAN)</b> works the same way. The air is the shared medium. Each <b>access point (AP)</b> is a table host. The "topic" is the <b>channel</b>, a slice of radio frequency. The loudness is <b>transmit power</b>. The invitation check is <b>authentication and encryption</b>. Almost every wireless problem you will meet in the field is one of these four things going wrong.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Parts of a wireless LAN">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">Router / firewall</text>
<rect x="210" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="275" y="47" text-anchor="middle" class="svg-ink" font-size="13">Switch (PoE)</text>
<rect x="400" y="20" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="500" y="40" text-anchor="middle" class="svg-ink" font-size="13">Wireless controller</text><text x="500" y="56" text-anchor="middle" class="svg-muted" font-size="12">optional, manages APs</text>
<line x1="150" y1="42" x2="210" y2="42" stroke="#64748b" stroke-width="2"/><line x1="340" y1="42" x2="400" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="110" y="130" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="165" y="155" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="330" y="130" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="385" y="155" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<line x1="260" y1="64" x2="165" y2="130" stroke="#64748b" stroke-width="2"/><line x1="290" y1="64" x2="385" y2="130" stroke="#64748b" stroke-width="2"/>
<ellipse cx="165" cy="200" rx="110" ry="42" fill="none" stroke="#64748b" stroke-dasharray="4 4"/><ellipse cx="385" cy="200" rx="110" ry="42" fill="none" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="165" y="215" text-anchor="middle" class="svg-accent" font-size="12">channel 1</text><text x="385" y="215" text-anchor="middle" class="svg-accent" font-size="12">channel 6</text>
<rect x="500" y="170" width="120" height="40" rx="8" fill="#fde68a"/><text x="560" y="195" text-anchor="middle" class="svg-ink" font-size="13">Laptops, phones</text>
<text x="275" y="252" text-anchor="middle" class="svg-muted" font-size="12">Wired side = Ethernet and VLANs; wireless side = shared air and channels</text>
</svg><p class="cap">A WLAN is a wired network with a radio edge. APs connect to a switch, often through PoE, and may be managed by a controller.</p></div>

<h3>Where wireless sits in the network</h3>
<p>An access point is a <b>Layer 2 bridge</b> between the 802.11 radio world and the 802.3 Ethernet world. A laptop that joins the Wi-Fi gets an IP address from the same DHCP server and uses the same default gateway as a wired PC in that VLAN. That is why everything you learned about VLANs and trunks still applies: each wireless network name (SSID) is normally mapped to a VLAN on the wired side.</p>
<p>The standards body behind Wi-Fi is the <b>IEEE 802.11</b> working group. The <b>Wi-Fi Alliance</b> is an industry group that tests products and gives them friendly names such as Wi-Fi 6 and security certifications such as WPA3. Exams use both names, so learn the pairs.</p>

<h3>Why wireless is different from Ethernet</h3>
<ul>
<li><b>Half duplex and shared.</b> On a channel only one radio transmits at a time. Stations use <b>CSMA/CA</b> (carrier sense multiple access with collision avoidance): listen, wait a random back-off, send, wait for an acknowledgement. More clients and more neighbouring APs on the same channel mean less airtime for each.</li>
<li><b>The medium is not private.</b> Anyone in range can receive the frames, so encryption is mandatory for business networks.</li>
<li><b>The signal fades.</b> Walls, glass, water, people and distance weaken radio waves. Coverage must be designed and measured, not assumed.</li>
<li><b>It is regulated.</b> Governments decide which frequencies and power levels are legal in each country.</li>
</ul>

<h3>Four words you will use all the time</h3>
<dl class="terms">
<dt>dBm</dt><dd>Power relative to 1 milliwatt. 0 dBm = 1 mW, 10 dBm = 10 mW, 20 dBm = 100 mW. Every +3 dB doubles power; every +10 dB multiplies it by ten.</dd>
<dt>RSSI</dt><dd>Received signal strength, shown as a negative dBm value. -50 dBm is excellent, -67 dBm is the usual target for voice and video, -80 dBm is barely usable.</dd>
<dt>Noise floor</dt><dd>Background radio energy, typically around -90 to -95 dBm in an office.</dd>
<dt>SNR</dt><dd>Signal-to-noise ratio: signal minus noise floor. -65 dBm over a -92 dBm floor gives 27 dB. Aim for 25 dB or more for reliable data.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> An AP transmits at 20 dBm (100 mW). You lower it by 6 dB to 14 dBm. Two halvings of 3 dB each give 100 to 50 to 25 mW, one quarter of the power. The cell becomes smaller, which, as you will see in chapter 3, is often exactly what a dense office needs.</p></div>

<h3>How this module is organised</h3>
<p>Chapters 2 to 4 cover the radio layer: standards and bands, channels and width, regulatory rules. Chapters 5 to 7 cover the architecture: SSIDs and network types, antennas, autonomous versus lightweight APs. Chapters 8 and 9 cover security and guest access. Chapter 10 is the hands-on floor plan, chapter 11 the troubleshooting workflow, and chapter 12 your exam checklist. DHCP details come later in <i>DHCP, DNS and NAT</i>, and the general troubleshooting method in the final troubleshooting module.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking "more power and more APs means better Wi-Fi". Too many loud APs on few channels hear each other and share airtime, so the network gets slower. Good Wi-Fi is about the right number of cells, on different channels, at the right power.</p></div>

<div class="exam"><p><b>Exam trap.</b> An access point is a Layer 2 device, like a switch, even though it has an IP address for management. Wireless uses CSMA/CA, not CSMA/CD; collisions cannot be detected on the air, so they are avoided and every unicast frame is acknowledged.</p></div>

<div class="scn"><h4>The fastest AP made the office slower</h4><p>A small accounting firm replaced one old AP with three new ones "for more speed". Users complained that Wi-Fi was slower than before. A Wi-Fi analyser app showed all three APs on 2.4 GHz channel 6 at maximum power, each hearing the other two at -60 dBm. The three APs were effectively one shared channel with three times the contention. The engineer moved them to channels 1, 6 and 11, enabled 5 GHz on unique channels, and lowered power one step.</p><p><b>Lesson:</b> capacity comes from channel separation, not from the number of APs.</p></div>

<div class="iv"><p class="q">"How is a wireless LAN different from a wired Ethernet LAN?"</p><p>Strong answer: the medium is shared and half duplex, so stations use CSMA/CA and every unicast frame is acknowledged; the signal is broadcast into the air, so encryption and authentication are essential; the signal attenuates with distance and obstacles, so coverage must be surveyed; and frequencies and power are regulated per country. Mention that an AP bridges 802.11 to 802.3 and that each SSID maps to a VLAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A WLAN is an Ethernet network with a radio edge; each SSID usually maps to a VLAN.</li>
<li>The air is shared and half duplex: CSMA/CA with acknowledgements.</li>
<li>Channel, transmit power, coverage and security explain almost every wireless problem.</li>
<li>dBm is logarithmic: +3 dB doubles, +10 dB is ten times; RSSI -67 dBm and SNR 25 dB are common design targets.</li>
<li>IEEE writes the 802.11 standards; the Wi-Fi Alliance certifies products and names generations.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap kisi site ke liye sahi 802.11 standard aur frequency band chun paoge, bina overlap ke channels aur channel widths plan kar paoge, SSID, BSSID aur ESSID samjha paoge, infrastructure, mesh, ad hoc aur point-to-point designs mein se chun paoge, antennas chun paoge, autonomous aur lightweight access points compare kar paoge, WPA2 ya WPA3 se WLAN ko pre-shared key ya 802.1X ke saath secure kar paoge, captive portal ke saath guest network bana paoge, aur classic wireless faults troubleshoot kar paoge: interference, channel overlap, weak signal, kam coverage, disassociation aur roaming problems. Lab mein aap ek live controller par ek asli office floor ke channels bhi plan karoge.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki VLAN aur trunk kya hote hain (module <i>VLANs, trunks aur inter-VLAN routing</i>), IP addressing aur default gateway kaise kaam karte hain, aur OSI layers. Radio ka koi background nahi chahiye; hum zero se banayenge.</p>

<h3>Ek analogy: baaton se bhara conference hall</h3>
<p>Ek bada conference hall socho. Har table par ek group baat kar raha hai. Sab same hawa share karte hain, isliye ek table par ek time par ek hi insaan bol sakta hai, aur agar do tables bahut paas hon aur same "topic" par bolein, to ek doosre ki awaaz daba dete hain. Ek achha event planner tables ko door door rakhta hai, padosi tables ko alag topics deta hai, zor se bolne walon ko awaaz kam karne ko kehta hai, aur darwaze par ek host rakhta hai jo invitations check karta hai.</p>
<p>Ek <b>wireless LAN (WLAN)</b> bilkul aise hi kaam karta hai. Hawa shared medium hai. Har <b>access point (AP)</b> ek table host hai. "Topic" <b>channel</b> hai, radio frequency ka ek tukda. Awaaz ki oonchai <b>transmit power</b> hai. Invitation check <b>authentication aur encryption</b> hai. Field mein milne wali lagbhag har wireless problem inhi chaar cheezon mein se kisi ke galat hone se hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Wireless LAN ke hisse">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">Router / firewall</text>
<rect x="210" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="275" y="47" text-anchor="middle" class="svg-ink" font-size="13">Switch (PoE)</text>
<rect x="400" y="20" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="500" y="40" text-anchor="middle" class="svg-ink" font-size="13">Wireless controller</text><text x="500" y="56" text-anchor="middle" class="svg-muted" font-size="12">optional, APs manage karta hai</text>
<line x1="150" y1="42" x2="210" y2="42" stroke="#64748b" stroke-width="2"/><line x1="340" y1="42" x2="400" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="110" y="130" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="165" y="155" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="330" y="130" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="385" y="155" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<line x1="260" y1="64" x2="165" y2="130" stroke="#64748b" stroke-width="2"/><line x1="290" y1="64" x2="385" y2="130" stroke="#64748b" stroke-width="2"/>
<ellipse cx="165" cy="200" rx="110" ry="42" fill="none" stroke="#64748b" stroke-dasharray="4 4"/><ellipse cx="385" cy="200" rx="110" ry="42" fill="none" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="165" y="215" text-anchor="middle" class="svg-accent" font-size="12">channel 1</text><text x="385" y="215" text-anchor="middle" class="svg-accent" font-size="12">channel 6</text>
<rect x="500" y="170" width="120" height="40" rx="8" fill="#fde68a"/><text x="560" y="195" text-anchor="middle" class="svg-ink" font-size="13">Laptops, phones</text>
<text x="275" y="252" text-anchor="middle" class="svg-muted" font-size="12">Wired side = Ethernet aur VLANs; wireless side = shared hawa aur channels</text>
</svg><p class="cap">WLAN ek wired network hai jiska edge radio hai. APs switch se judte hain, aksar PoE ke through, aur controller se manage ho sakte hain.</p></div>

<h3>Network mein wireless kahan baithta hai</h3>
<p>Access point 802.11 radio duniya aur 802.3 Ethernet duniya ke beech ek <b>Layer 2 bridge</b> hai. Jo laptop Wi-Fi join karta hai, use usi DHCP server se IP address milta hai aur woh usi default gateway ko use karta hai jo us VLAN ka wired PC use karta hai. Isiliye VLANs aur trunks ke baare mein jo seekha, sab abhi bhi laagu hai: har wireless network naam (SSID) normally wired side par ek VLAN se map hota hai.</p>
<p>Wi-Fi ke peeche standards body <b>IEEE 802.11</b> working group hai. <b>Wi-Fi Alliance</b> ek industry group hai jo products test karta hai aur unhe Wi-Fi 6 jaise friendly naam aur WPA3 jaise security certifications deta hai. Exams dono naam use karte hain, isliye jode yaad karo.</p>

<h3>Wireless Ethernet se alag kyun hai</h3>
<ul>
<li><b>Half duplex aur shared.</b> Ek channel par ek time par ek hi radio transmit karta hai. Stations <b>CSMA/CA</b> (carrier sense multiple access with collision avoidance) use karte hain: suno, random back-off wait karo, bhejo, acknowledgement ka wait karo. Same channel par jitne zyada clients aur padosi APs, har ek ke liye utna kam airtime.</li>
<li><b>Medium private nahi hai.</b> Range mein koi bhi frames receive kar sakta hai, isliye business networks ke liye encryption zaroori hai.</li>
<li><b>Signal kamzor hota hai.</b> Deewarein, glass, paani, log aur doori radio waves ko kamzor karte hain. Coverage design aur measure karni padti hai, maan nahi sakte.</li>
<li><b>Yeh regulated hai.</b> Sarkarein tay karti hain ki har desh mein kaunsi frequencies aur power levels legal hain.</li>
</ul>

<h3>Chaar shabd jo aap hamesha use karoge</h3>
<dl class="terms">
<dt>dBm</dt><dd>1 milliwatt ke relative power. 0 dBm = 1 mW, 10 dBm = 10 mW, 20 dBm = 100 mW. Har +3 dB power double karta hai; har +10 dB use das guna karta hai.</dd>
<dt>RSSI</dt><dd>Received signal strength, negative dBm value mein. -50 dBm excellent hai, -67 dBm voice aur video ka usual target hai, -80 dBm mushkil se usable hai.</dd>
<dt>Noise floor</dt><dd>Background radio energy, office mein aam taur par -90 se -95 dBm ke aas paas.</dd>
<dt>SNR</dt><dd>Signal-to-noise ratio: signal minus noise floor. -92 dBm floor par -65 dBm se 27 dB milta hai. Reliable data ke liye 25 dB ya zyada ka target rakho.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Ek AP 20 dBm (100 mW) par transmit karta hai. Aap use 6 dB kam karke 14 dBm karte ho. 3 dB ke do halvings se 100 se 50 se 25 mW, yaani power ka ek chauthai. Cell chhota ho jaata hai, jo, jaisa aap chapter 3 mein dekhoge, aksar ek dense office ko bilkul yahi chahiye.</p></div>

<h3>Yeh module kaise organised hai</h3>
<p>Chapters 2 se 4 radio layer cover karte hain: standards aur bands, channels aur width, regulatory rules. Chapters 5 se 7 architecture cover karte hain: SSIDs aur network types, antennas, autonomous vs lightweight APs. Chapters 8 aur 9 security aur guest access cover karte hain. Chapter 10 hands-on floor plan hai, chapter 11 troubleshooting workflow, aur chapter 12 aapki exam checklist. DHCP ki details baad mein <i>DHCP, DNS aur NAT</i> mein aati hain, aur general troubleshooting method aakhri troubleshooting module mein.</p>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki "zyada power aur zyada APs matlab behtar Wi-Fi". Kam channels par bahut saare zor se bolne wale APs ek doosre ko sunte hain aur airtime share karte hain, isliye network aur slow ho jaata hai. Achha Wi-Fi sahi sankhya ke cells, alag channels aur sahi power ke baare mein hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Access point ek Layer 2 device hai, switch jaisa, bhale hi management ke liye uska IP address ho. Wireless CSMA/CA use karta hai, CSMA/CD nahi; hawa par collisions detect nahi ho sakte, isliye unse bacha jaata hai aur har unicast frame acknowledge hota hai.</p></div>

<div class="scn"><h4>Sabse tez AP ne office ko slow kar diya</h4><p>Ek chhoti accounting firm ne "zyada speed ke liye" ek purana AP teen naye APs se badal diya. Users ne shikayat ki ki Wi-Fi pehle se slow hai. Ek Wi-Fi analyser app ne dikhaya ki teeno APs 2.4 GHz channel 6 par maximum power par the, har ek baaki do ko -60 dBm par sun raha tha. Teeno APs asal mein ek shared channel the, teen guna contention ke saath. Engineer ne unhe channels 1, 6 aur 11 par shift kiya, unique channels par 5 GHz enable kiya, aur power ek step kam ki.</p><p><b>Seekh:</b> capacity channel separation se aati hai, APs ki sankhya se nahi.</p></div>

<div class="iv"><p class="q">"Wireless LAN wired Ethernet LAN se kaise alag hai?"</p><p>Strong answer: medium shared aur half duplex hai, isliye stations CSMA/CA use karte hain aur har unicast frame acknowledge hota hai; signal hawa mein broadcast hota hai, isliye encryption aur authentication zaroori hain; signal doori aur rukawaton se kamzor hota hai, isliye coverage ka survey karna padta hai; aur frequencies aur power har desh mein regulated hain. Batao ki AP 802.11 ko 802.3 se bridge karta hai aur har SSID ek VLAN se map hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WLAN ek Ethernet network hai jiska edge radio hai; har SSID aam taur par ek VLAN se map hota hai.</li>
<li>Hawa shared aur half duplex hai: acknowledgements ke saath CSMA/CA.</li>
<li>Channel, transmit power, coverage aur security lagbhag har wireless problem samjhate hain.</li>
<li>dBm logarithmic hai: +3 dB double, +10 dB das guna; RSSI -67 dBm aur SNR 25 dB common design targets hain.</li>
<li>IEEE 802.11 standards likhta hai; Wi-Fi Alliance products certify karta hai aur generations ko naam deta hai.</li>
</ul></div>
`}};export{e as default};