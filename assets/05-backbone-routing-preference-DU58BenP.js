var e={id:`backbone-routing-preference`,h:{en:`Backbone routing and routing preference`,hi:`Backbone routing aur routing preference`},body:{en:`
<p>One corridor to your warehouse is fine for a small company. A larger company builds two or three corridors in different cities. Now a new question appears: when a parcel goes in through one corridor, may the reply come back through another? And should a parcel leave the courier network at the closest door or travel further on the courier's own highways? Prisma Access answers these with two settings: <b>Backbone Routing</b> and <b>Routing Preference</b>.</p>

<h3>Why this only matters with several service connections</h3>
<p>With a single service connection, there is only one path to HQ, so every flow goes out and returns the same way. When you add a second service connection (for example in another city) a flow can enter HQ through one and the reply can come from HQ through the other. That is <b>asymmetric routing</b>. Stateful firewalls dislike asymmetry, so the service lets you choose what to allow.</p>

<h3>Backbone Routing</h3>
<p>Location: SCM in the Prisma Access infrastructure settings; Panorama in Service Setup &gt; Backbone Routing. Three values exist.</p>
<table class="cmp"><tr><th>Panorama / API value</th><th>SCM label</th><th>Meaning</th></tr>
<tr><td>no-asymmetric-routing</td><td>Disable asymmetric routing</td><td>Return traffic must use the same service connection as the outbound flow</td></tr>
<tr><td>asymmetric-routing-only</td><td>Allow asymmetric routing</td><td>Return traffic may come through a different service connection</td></tr>
<tr><td>asymmetric-routing-with-load-share</td><td>Allow asymmetric routing and load sharing across Service Connections</td><td>As above, and Prisma Access may share traffic across service connections. This is the stated default</td></tr>
</table>
<p>If most of your flows are asymmetric, the Panorama option <b>Disable Traffic Logging on Service Connections</b> is advised, because logging such flows adds noise and load.</p>

<h3>Routing Preference</h3>
<p>Prisma Access offers two values: <b>Default</b> and <b>Hot potato</b>. In networking, "hot potato" means passing traffic to the nearest exit as quickly as possible rather than carrying it far across your own network. In Panorama, a Backup SC can be chosen for a service connection only when BGP and hot potato routing are used. Read your release notes for how each value ranks equal routes, because the public documentation names the options without describing every tie-break.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two service connections">
<rect x="250" y="80" width="140" height="70" rx="10" fill="#bae6fd"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">backbone</text>
<rect x="30" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="100" y="48" text-anchor="middle" class="svg-ink" font-size="13">SC-A (city 1)</text><text x="100" y="66" text-anchor="middle" class="svg-muted" font-size="11">to HQ-FW</text>
<rect x="30" y="150" width="140" height="60" rx="10" fill="#fde68a"/><text x="100" y="178" text-anchor="middle" class="svg-ink" font-size="13">SC-B (city 2)</text><text x="100" y="196" text-anchor="middle" class="svg-muted" font-size="11">to HQ-FW</text>
<rect x="470" y="80" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="545" y="110" text-anchor="middle" class="svg-ink" font-size="13">Mobile / branch</text><text x="545" y="130" text-anchor="middle" class="svg-muted" font-size="11">sources</text>
<line x1="170" y1="50" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="170" y1="180" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="390" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="210" y="125" class="svg-accent" font-size="11">out via A, back via B?</text>
</svg><p class="cap">Asymmetric routing is possible when more than one service connection reaches the same HQ.</p></div>

<h3>Choosing</h3>
<table class="cmp"><tr><th>Situation</th><th>Choice</th></tr>
<tr><td>One service connection</td><td>Defaults are fine</td></tr>
<tr><td>Two or more, HQ firewall is stateful and strict</td><td>Consider disable asymmetric routing, or keep sessions symmetrical by design</td></tr>
<tr><td>Two or more, resilience and speed matter most</td><td>Allow asymmetric routing and load sharing (default)</td></tr>
<tr><td>Need a standby service connection with BGP</td><td>Backup SC with hot potato</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A company has SC-A in Mumbai and SC-B in Singapore, both to its data centre firewalls. Mobile users in Delhi connect to the nearest gateway, and traffic to 10.10.0.50 may use either service connection. The default (allow asymmetric routing and load sharing) keeps both busy. If the data centre firewalls cannot see both directions of a flow, the admin switches to Disable asymmetric routing and checks the result in the traffic logs.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving the default load-sharing mode when the data centre has independent stateful firewalls behind each tunnel; expecting these settings to matter on a single service connection; assuming hot potato is the same as shortest geographic path.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the three Backbone Routing values and the stated default (asymmetric routing with load sharing). Know the two Routing Preference values: Default and Hot potato. Backup SC needs BGP and hot potato.</p></div>

<div class="scn"><h4>Half the sessions reset</h4><p>After adding a second service connection, a data centre team reported that some sessions reset. Each service connection ended on a different firewall. Replies sometimes returned on the other tunnel and were dropped by the stateful firewall. Setting the backbone to disable asymmetric routing kept replies on the original path, and the resets stopped.</p><p><b>Lesson:</b> more paths means more routing decisions. Make the state and the path agree.</p></div>

<div class="iv"><p class="q">"What is Backbone Routing in Prisma Access?"</p><p>It controls whether return traffic may use a different service connection than the outbound flow. The values are no-asymmetric-routing, asymmetric-routing-only and asymmetric-routing-with-load-share, the last being the default. It matters once there are two or more service connections.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Backbone Routing has three values; load-sharing asymmetric is the default.</li>
<li>Routing Preference is Default or Hot potato.</li>
<li>These choices matter with multiple service connections.</li>
<li>Panorama can disable traffic logging on service connections when flows are mostly asymmetric.</li>
<li>Backup SC in Panorama needs BGP and hot potato.</li>
</ul></div>
`,hi:`
<p>Chhoti company ke liye warehouse tak ek corridor theek hai. Badi company alag shehron mein do-teen corridors banati hai. Ab ek naya sawaal aata hai: parcel ek corridor se andar gaya to kya reply doosre se aa sakta hai? Aur parcel nazdeeki darwaze se courier network chhode ya courier ke apne highways par aur door tak jaaye? Prisma Access iska jawab do settings se deta hai: <b>Backbone Routing</b> aur <b>Routing Preference</b>.</p>

<h3>Yeh sirf kai service connections ke saath kyun matter karta hai</h3>
<p>Ek service connection ke saath HQ tak sirf ek path hai, isliye har flow ek hi raaste se jaata aur aata hai. Doosra service connection (jaise alag shehar mein) add karoge to flow ek se HQ mein ja sakta hai aur reply doosre se aa sakta hai. Ise <b>asymmetric routing</b> kehte hain. Stateful firewalls asymmetry pasand nahi karte, isliye service aapko choose karne deti hai ki kya allow ho.</p>

<h3>Backbone Routing</h3>
<p>Location: SCM mein Prisma Access infrastructure settings; Panorama mein Service Setup &gt; Backbone Routing. Teen values hain.</p>
<table class="cmp"><tr><th>Panorama / API value</th><th>SCM label</th><th>Matlab</th></tr>
<tr><td>no-asymmetric-routing</td><td>Disable asymmetric routing</td><td>Return traffic outbound flow wale hi service connection se aana chahiye</td></tr>
<tr><td>asymmetric-routing-only</td><td>Allow asymmetric routing</td><td>Return traffic doosre service connection se aa sakta hai</td></tr>
<tr><td>asymmetric-routing-with-load-share</td><td>Allow asymmetric routing and load sharing across Service Connections</td><td>Upar jaisa, aur Prisma Access service connections ke beech traffic share kar sakta hai. Yeh stated default hai</td></tr>
</table>
<p>Zyadatar flows asymmetric hon to Panorama option <b>Disable Traffic Logging on Service Connections</b> advised hai, kyunki aise flows ka logging noise aur load badhata hai.</p>

<h3>Routing Preference</h3>
<p>Prisma Access do values deta hai: <b>Default</b> aur <b>Hot potato</b>. Networking mein "hot potato" ka matlab hai traffic ko apne network mein door tak le jaane ki jagah nazdeeki exit ko jaldi se pass kar dena. Panorama mein Backup SC sirf tab chuna ja sakta hai jab BGP aur hot potato routing use ho. Har value equal routes ko kaise rank karti hai iske liye apni release notes padho, kyunki public documentation options ke naam batati hai par har tie-break describe nahi karti.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two service connections">
<rect x="250" y="80" width="140" height="70" rx="10" fill="#bae6fd"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">backbone</text>
<rect x="30" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="100" y="48" text-anchor="middle" class="svg-ink" font-size="13">SC-A (city 1)</text><text x="100" y="66" text-anchor="middle" class="svg-muted" font-size="11">HQ-FW tak</text>
<rect x="30" y="150" width="140" height="60" rx="10" fill="#fde68a"/><text x="100" y="178" text-anchor="middle" class="svg-ink" font-size="13">SC-B (city 2)</text><text x="100" y="196" text-anchor="middle" class="svg-muted" font-size="11">HQ-FW tak</text>
<rect x="470" y="80" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="545" y="110" text-anchor="middle" class="svg-ink" font-size="13">Mobile / branch</text><text x="545" y="130" text-anchor="middle" class="svg-muted" font-size="11">sources</text>
<line x1="170" y1="50" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="170" y1="180" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="390" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="210" y="125" class="svg-accent" font-size="11">A se gaya, B se aaya?</text>
</svg><p class="cap">Ek se zyada service connection same HQ tak pahunche to asymmetric routing possible hai.</p></div>

<h3>Choose kaise karein</h3>
<table class="cmp"><tr><th>Situation</th><th>Choice</th></tr>
<tr><td>Ek service connection</td><td>Defaults theek hain</td></tr>
<tr><td>Do ya zyada, HQ firewall stateful aur strict</td><td>Disable asymmetric routing consider karo, ya design se sessions symmetrical rakho</td></tr>
<tr><td>Do ya zyada, resilience aur speed sabse zaroori</td><td>Allow asymmetric routing and load sharing (default)</td></tr>
<tr><td>BGP ke saath standby service connection chahiye</td><td>Hot potato ke saath Backup SC</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Company ke paas Mumbai mein SC-A aur Singapore mein SC-B hain, dono data centre firewalls tak. Delhi ke mobile users nearest gateway se connect karte hain, aur 10.10.0.50 ka traffic dono service connections mein se kisi se bhi ja sakta hai. Default (allow asymmetric routing and load sharing) dono ko busy rakhta hai. Data centre firewalls flow ki dono directions nahi dekh paate to admin Disable asymmetric routing par switch karta hai aur traffic logs mein result check karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Jab data centre mein har tunnel ke peeche alag stateful firewalls hon tab bhi default load-sharing mode chhod dena; ek service connection par in settings ke matter karne ki ummeed; hot potato ko shortest geographic path samajhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Backbone Routing ki teen values aur stated default (asymmetric routing with load sharing) yaad rakho. Routing Preference ki do values: Default aur Hot potato. Backup SC ko BGP aur hot potato chahiye.</p></div>

<div class="scn"><h4>Aadhe sessions reset</h4><p>Doosra service connection add karne ke baad data centre team ne kuch sessions reset hone ki shikayat ki. Har service connection alag firewall par end hota tha. Replies kabhi doosre tunnel par wapas aate aur stateful firewall unhe drop kar deta. Backbone ko disable asymmetric routing par karne se replies original path par rahe, aur resets ruk gaye.</p><p><b>Lesson:</b> zyada paths matlab zyada routing decisions. State aur path ko agree karwao.</p></div>

<div class="iv"><p class="q">"Prisma Access mein Backbone Routing kya hai?"</p><p>Yeh control karta hai ki return traffic outbound flow se alag service connection use kar sakta hai ya nahi. Values no-asymmetric-routing, asymmetric-routing-only aur asymmetric-routing-with-load-share hain, aakhri default hai. Yeh tab matter karta hai jab do ya zyada service connections hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Backbone Routing ki teen values hain; load-sharing asymmetric default hai.</li>
<li>Routing Preference Default ya Hot potato hai.</li>
<li>Yeh choices kai service connections ke saath matter karte hain.</li>
<li>Zyadatar asymmetric flows mein Panorama service connections par traffic logging disable kar sakta hai.</li>
<li>Panorama mein Backup SC ko BGP aur hot potato chahiye.</li>
</ul></div>
`}};export{e as default};