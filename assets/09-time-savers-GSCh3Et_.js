var e={id:`time-savers`,h:{en:`Time-savers: the commands that answer the question directly`,hi:`Time-savers: woh commands jo seedha sawaal ka jawab dete hain`},body:{en:`
<p>If you want to know whether a book is in a library, you can walk every shelf, or you can ask the catalogue. Both give the right answer; one takes an hour and the other ten seconds. In the ENARSI exam and in a real outage, time is the scarcest resource you have. This chapter collects the "catalogue" commands: the ones that answer a precise question without making you read hundreds of lines, and the ones that make changes and rollbacks fast and safe.</p>

<h3>Ask about one destination: <code>show ip route x.x.x.x</code></h3>
<p>Instead of scanning the whole routing table, ask for one address. IOS performs the longest-match lookup for you and prints the full detail of the winning route, including the source, AD, metric, OSPF route type, the router that advertised it (<code>from 10.255.0.2</code>) and every next hop. Related forms: <code>show ip route 10.3.0.0 255.255.0.0 longer-prefixes</code> lists every more-specific route inside a block (great for summarisation problems), and <code>show ip route ospf</code>, <code>show ip route eigrp</code> or <code>show ip route bgp</code> limit the output to one source.</p>

<h3>Ask what the hardware will do: <code>show ip cef exact-route</code></h3>
<p>With equal-cost paths or PBR, the routing table does not tell you which link a particular flow will use. <code>show ip cef exact-route 10.1.10.10 10.3.30.10</code> gives the exact exit interface and next hop CEF selects for that source and destination pair. Use it to prove which of two ECMP links carries the problem flow before you start capturing packets.</p>

<h3>Read only the relevant configuration: <code>| section</code> and friends</h3>
<pre class="code">R2# show running-config | section router
R2# show running-config | section ^interface GigabitEthernet0/1
R2# show running-config interface GigabitEthernet0/1
R2# show running-config | include ^router|redistribute|distribute-list
R2# show ip protocols | include Routing Protocol|Redistributing</pre>
<p><code>| section</code> prints a block and all its indented children; <code>show running-config interface</code> prints one interface. The <code>include</code> with several patterns separated by <code>|</code> gives you a one-screen overview of routing processes, redistribution and filters. <code>show ip protocols</code> is the single best overview of every routing process: networks, passive interfaces, filters, redistribution, AD changes and neighbours (information sources).</p>

<h3>Stay in configuration mode: <code>do</code></h3>
<p>Leaving configuration mode to verify and re-entering it wastes seconds on every step. Prefix any exec command with <code>do</code>: <code>R2(config-router)# do show ip eigrp neighbors</code>. Combine it with filters: <code>do show run | section router eigrp</code>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Safe change with rollback timer">
<rect x="20" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="62" text-anchor="middle" class="svg-ink" font-size="12">configure terminal</text><text x="85" y="78" text-anchor="middle" class="svg-muted" font-size="12">revert timer 5</text>
<rect x="180" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="245" y="70" text-anchor="middle" class="svg-ink" font-size="12">make the change</text>
<rect x="340" y="10" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="32" text-anchor="middle" class="svg-ink" font-size="12">still reachable</text><text x="405" y="48" text-anchor="middle" class="svg-muted" font-size="12">configure confirm</text>
<rect x="340" y="110" width="130" height="50" rx="8" fill="#fed7aa"/><text x="405" y="132" text-anchor="middle" class="svg-ink" font-size="12">locked out</text><text x="405" y="148" text-anchor="middle" class="svg-muted" font-size="12">no confirm</text>
<rect x="500" y="110" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="565" y="132" text-anchor="middle" class="svg-ink" font-size="12">auto rollback</text><text x="565" y="148" text-anchor="middle" class="svg-muted" font-size="12">after 5 minutes</text>
<line x1="150" y1="65" x2="180" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="340" y2="40" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="340" y2="130" stroke="#64748b" stroke-width="2"/><line x1="470" y1="135" x2="500" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Needs an archive path; the rollback uses the saved config</text>
</svg><p class="cap">The revert timer: if you lock yourself out, the router puts the old configuration back on its own.</p></div>

<h3>Fast, safe rollback: archive, <code>configure replace</code> and the revert timer</h3>
<p>With an <code>archive path</code> configured (chapter 7), IOS gives you two rollback tools. <code>configure terminal revert timer 5</code> saves the current configuration and starts a timer; if you do not type <code>configure confirm</code> within 5 minutes, the router rolls back by itself. Perfect for remote changes that might cut your own access, such as an ACL on the management interface. <code>configure replace</code> replaces the whole running configuration with a saved file, applying only the differences, so it is not a disruptive reload:</p>
<pre class="out">R3# configure replace flash:R3-cfg-2 list
This will apply all necessary additions and deletions
to replace the current running configuration with the
contents of the specified configuration file, which is
assumed to be a complete configuration, not a partial
configuration. Enter Y if you are sure you want to proceed. ? [no]: y
!Pass 1
!List of Commands:
<span class="hl">interface GigabitEthernet0/2
 no ip access-group SRV-PROTECT out
no ip access-list extended SRV-PROTECT</span>
end
Total number of passes: 1
Rollback Done</pre>
<p>The <code>list</code> keyword prints the commands applied, which doubles as documentation of what the rollback changed. Before replacing, <code>show archive config differences flash:R3-cfg-2 system:running-config</code> shows the same difference without applying it.</p>

<div class="eg"><p><b>Worked example.</b> Question: "Which route and which exit interface does R1 use for SRV1, and who advertised the route?" The slow way: <code>show ip route</code> (40 lines), find the entry, then <code>show ip ospf database external</code> to find the advertising router. The fast way: <code>show ip route 10.3.30.10</code> shows "Known via ospf 1 ... type extern 2 ... from 10.255.0.2" in four lines, and <code>show ip cef exact-route 10.1.10.10 10.3.30.10</code> confirms Gi0/0. Two commands, under 20 seconds.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using <code>| include</code> on the running configuration and concluding that a command is missing. <code>include</code> shows single lines without context; a <code>redistribute</code> line could belong to any routing process. Use <code>| section</code> when the parent matters.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>configure replace</code> and <code>configure terminal revert timer</code> need the archive feature (<code>archive</code> with <code>path</code>) for the rollback to have something to return to. <code>configure confirm</code> stops the timer; without it the rollback happens even if the change was good.</p></div>

<div class="scn"><h4>The ACL that locked out the engineer</h4><p>An engineer applied a new inbound ACL to the WAN interface of a remote branch router at 23:00. The ACL was missing a permit for the management subnet, and his SSH session froze. There was no remote hands until morning. His colleague on another site had adopted the habit of always using <code>configure terminal revert timer 10</code> for remote ACL changes; on her router the same mistake undid itself after ten minutes. After that night the team made the revert timer mandatory in their change template.</p><p><b>Lesson:</b> build the rollback into the change itself, so it works even when you cannot reach the device.</p></div>

<div class="iv"><p class="q">"You are changing an ACL on a remote router with no out-of-band access. How do you protect yourself?"</p><p>Mention <code>configure terminal revert timer</code> with an archive path, and <code>configure confirm</code> once access is verified; or the older <code>reload in 10</code> with the startup configuration unchanged, cancelled with <code>reload cancel</code>. Add that you review the ACL for a management permit, apply it in the right direction, and have <code>configure replace</code> ready with a known good file.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show ip route x.x.x.x</code> does the longest-match lookup and shows full route detail; <code>longer-prefixes</code> shows what is inside a block.</li>
<li><code>show ip cef exact-route src dst</code> shows the exact exit for a flow, including ECMP and PBR effects.</li>
<li><code>| section</code>, <code>show running-config interface</code> and <code>show ip protocols</code> give focused configuration views.</li>
<li><code>do</code> runs exec commands from configuration mode.</li>
<li><code>configure terminal revert timer</code> plus <code>configure confirm</code>, and <code>configure replace ... list</code>, give safe, fast rollback.</li>
</ul></div>
`,hi:`
<p>Agar aap jaanna chahte ho ki koi kitaab library mein hai ya nahi, to aap har shelf dekh sakte ho, ya catalogue se pooch sakte ho. Dono sahi jawab dete hain; ek mein ek ghanta lagta hai aur doosre mein das second. ENARSI exam mein aur real outage mein, time aapka sabse kam resource hai. Yeh chapter "catalogue" commands ikattha karta hai: woh jo aapse sainkdon lines padhwaye bina ek precise sawaal ka jawab dete hain, aur woh jo changes aur rollbacks ko tez aur safe banate hain.</p>

<h3>Ek destination ke baare mein poochho: <code>show ip route x.x.x.x</code></h3>
<p>Poori routing table scan karne ki jagah ek address ke baare mein poochho. IOS aapke liye longest-match lookup karta hai aur jeetne wale route ki poori detail print karta hai, jismein source, AD, metric, OSPF route type, advertise karne wala router (<code>from 10.255.0.2</code>) aur har next hop shaamil hai. Related forms: <code>show ip route 10.3.0.0 255.255.0.0 longer-prefixes</code> ek block ke andar ka har zyada specific route list karta hai (summarisation problems ke liye badhiya), aur <code>show ip route ospf</code>, <code>show ip route eigrp</code> ya <code>show ip route bgp</code> output ko ek source tak limit karte hain.</p>

<h3>Poochho hardware kya karega: <code>show ip cef exact-route</code></h3>
<p>Equal-cost paths ya PBR ke saath, routing table nahi batati ki ek particular flow kaunsa link use karega. <code>show ip cef exact-route 10.1.10.10 10.3.30.10</code> us source aur destination pair ke liye CEF ka chuna exact exit interface aur next hop deta hai. Packets capture karna shuru karne se pehle ise yeh sabit karne ke liye use karo ki do ECMP links mein se kaunsa problem flow le jaata hai.</p>

<h3>Sirf relevant configuration padho: <code>| section</code> aur saathi</h3>
<pre class="code">R2# show running-config | section router
R2# show running-config | section ^interface GigabitEthernet0/1
R2# show running-config interface GigabitEthernet0/1
R2# show running-config | include ^router|redistribute|distribute-list
R2# show ip protocols | include Routing Protocol|Redistributing</pre>
<p><code>| section</code> ek block aur uske saare indented children print karta hai; <code>show running-config interface</code> ek interface print karta hai. <code>|</code> se alag kai patterns wala <code>include</code> aapko routing processes, redistribution aur filters ka ek-screen overview deta hai. <code>show ip protocols</code> har routing process ka sabse achha single overview hai: networks, passive interfaces, filters, redistribution, AD changes aur neighbours (information sources).</p>

<h3>Configuration mode mein raho: <code>do</code></h3>
<p>Verify karne ke liye configuration mode chhodna aur wapas aana har step par seconds barbaad karta hai. Kisi bhi exec command ke aage <code>do</code> lagao: <code>R2(config-router)# do show ip eigrp neighbors</code>. Ise filters ke saath milao: <code>do show run | section router eigrp</code>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Safe change with rollback timer">
<rect x="20" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="62" text-anchor="middle" class="svg-ink" font-size="12">configure terminal</text><text x="85" y="78" text-anchor="middle" class="svg-muted" font-size="12">revert timer 5</text>
<rect x="180" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="245" y="70" text-anchor="middle" class="svg-ink" font-size="12">change karo</text>
<rect x="340" y="10" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="32" text-anchor="middle" class="svg-ink" font-size="12">abhi bhi reachable</text><text x="405" y="48" text-anchor="middle" class="svg-muted" font-size="12">configure confirm</text>
<rect x="340" y="110" width="130" height="50" rx="8" fill="#fed7aa"/><text x="405" y="132" text-anchor="middle" class="svg-ink" font-size="12">locked out</text><text x="405" y="148" text-anchor="middle" class="svg-muted" font-size="12">confirm nahi</text>
<rect x="500" y="110" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="565" y="132" text-anchor="middle" class="svg-ink" font-size="12">auto rollback</text><text x="565" y="148" text-anchor="middle" class="svg-muted" font-size="12">5 minute baad</text>
<line x1="150" y1="65" x2="180" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="340" y2="40" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="340" y2="130" stroke="#64748b" stroke-width="2"/><line x1="470" y1="135" x2="500" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Archive path chahiye; rollback saved config use karta hai</text>
</svg><p class="cap">Revert timer: agar aap khud ko lock out kar do, to router purani configuration khud wapas laga deta hai.</p></div>

<h3>Tez, safe rollback: archive, <code>configure replace</code> aur revert timer</h3>
<p><code>archive path</code> configured hone par (chapter 7), IOS aapko do rollback tools deta hai. <code>configure terminal revert timer 5</code> current configuration save karta hai aur timer shuru karta hai; agar aap 5 minute ke andar <code>configure confirm</code> type nahi karte, to router khud roll back kar leta hai. Aise remote changes ke liye perfect jo aapka apna access kaat sakte hain, jaise management interface par ACL. <code>configure replace</code> poori running configuration ko saved file se replace karta hai, sirf differences apply karke, isliye yeh disruptive reload nahi hai:</p>
<pre class="out">R3# configure replace flash:R3-cfg-2 list
This will apply all necessary additions and deletions
to replace the current running configuration with the
contents of the specified configuration file, which is
assumed to be a complete configuration, not a partial
configuration. Enter Y if you are sure you want to proceed. ? [no]: y
!Pass 1
!List of Commands:
<span class="hl">interface GigabitEthernet0/2
 no ip access-group SRV-PROTECT out
no ip access-list extended SRV-PROTECT</span>
end
Total number of passes: 1
Rollback Done</pre>
<p><code>list</code> keyword apply hue commands print karta hai, jo is baat ki documentation bhi ban jaati hai ki rollback ne kya badla. Replace karne se pehle, <code>show archive config differences flash:R3-cfg-2 system:running-config</code> wahi difference bina apply kiye dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Sawaal: "R1 SRV1 ke liye kaunsa route aur kaunsa exit interface use karta hai, aur route kisne advertise kiya?" Dheema tarika: <code>show ip route</code> (40 lines), entry dhoondho, phir advertising router dhoondhne ke liye <code>show ip ospf database external</code>. Tez tarika: <code>show ip route 10.3.30.10</code> chaar lines mein "Known via ospf 1 ... type extern 2 ... from 10.255.0.2" dikhata hai, aur <code>show ip cef exact-route 10.1.10.10 10.3.30.10</code> Gi0/0 confirm karta hai. Do commands, 20 second se kam.</p></div>

<div class="warn"><p><b>Common galti.</b> Running configuration par <code>| include</code> use karke yeh nateeja nikaalna ki command missing hai. <code>include</code> bina context ke single lines dikhata hai; <code>redistribute</code> line kisi bhi routing process ki ho sakti hai. Jab parent matter kare to <code>| section</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>configure replace</code> aur <code>configure terminal revert timer</code> ko archive feature (<code>path</code> ke saath <code>archive</code>) chahiye taaki rollback ke paas wapas jaane ke liye kuch ho. <code>configure confirm</code> timer rokta hai; iske bina rollback ho jaata hai chahe change achha tha.</p></div>

<div class="scn"><h4>Woh ACL jisne engineer ko lock out kar diya</h4><p>Ek engineer ne raat 23:00 baje ek remote branch router ke WAN interface par naya inbound ACL lagaya. ACL mein management subnet ka permit missing tha, aur uska SSH session freeze ho gaya. Subah tak koi remote hands nahi the. Doosri site par uski colleague ne remote ACL changes ke liye hamesha <code>configure terminal revert timer 10</code> use karne ki aadat daali thi; uske router par wahi galti das minute baad khud undo ho gayi. Us raat ke baad team ne apne change template mein revert timer mandatory kar diya.</p><p><b>Seekh:</b> rollback ko change ke andar hi build karo, taaki woh tab bhi kaam kare jab aap device tak na pahunch sako.</p></div>

<div class="iv"><p class="q">"Aap bina out-of-band access wale remote router par ACL badal rahe ho. Khud ko kaise bachaoge?"</p><p>Archive path ke saath <code>configure terminal revert timer</code> mention karo, aur access verify hone par <code>configure confirm</code>; ya purana <code>reload in 10</code> startup configuration ko bina badle, <code>reload cancel</code> se cancel. Jodo ki aap ACL mein management permit review karte ho, use sahi direction mein lagate ho, aur known good file ke saath <code>configure replace</code> tayyar rakhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show ip route x.x.x.x</code> longest-match lookup karta hai aur poori route detail dikhata hai; <code>longer-prefixes</code> dikhata hai block ke andar kya hai.</li>
<li><code>show ip cef exact-route src dst</code> flow ka exact exit dikhata hai, ECMP aur PBR effects samet.</li>
<li><code>| section</code>, <code>show running-config interface</code> aur <code>show ip protocols</code> focused configuration views dete hain.</li>
<li><code>do</code> configuration mode se exec commands chalata hai.</li>
<li><code>configure terminal revert timer</code> plus <code>configure confirm</code>, aur <code>configure replace ... list</code>, safe aur tez rollback dete hain.</li>
</ul></div>
`}};export{e as default};