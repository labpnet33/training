var e={id:`as-number-tricks`,h:{en:`AS-number tricks: local-as, remove-private, as-override and loops`,hi:`AS-number tricks: local-as, remove-private, as-override aur loops`},body:{en:`
<p>BGP uses the AS number as identity and as loop detection. That is elegant until real life intervenes: companies merge, customers use private AS numbers, and several customer sites share one AS number. Junos has a small set of options to bend the AS-number rules without breaking BGP. Know what each one changes: the OPEN message, the AS path you send, the AS path you receive, or loop detection.</p>

<h3>The toolbox</h3>
<table class="cmp"><tr><th>Statement</th><th>Use it when</th><th>Effect</th></tr>
<tr><td><code>local-as N</code></td><td>after a merger a peer still expects your old AS</td><td>OPEN uses N; N is added in front of the path you send; N is also prepended to routes you receive</td></tr>
<tr><td><code>local-as N private</code></td><td>you do not want the old AS inside your own network</td><td>N is not prepended to <b>received</b> routes</td></tr>
<tr><td><code>local-as N no-prepend-global-as</code></td><td>the peer must not see the new AS yet</td><td>only N is prepended on routes you send</td></tr>
<tr><td><code>remove-private</code></td><td>a customer uses a private AS (64512-65534, 4200000000-4294967294)</td><td>private AS numbers are stripped from the path sent to EBGP peers</td></tr>
<tr><td><code>as-override</code></td><td>several customer sites use the same AS (hub and spoke)</td><td>the peer's AS in the path is replaced with yours</td></tr>
<tr><td><code>autonomous-system N loops 2</code></td><td>the receiving side may see its own AS once</td><td>a route containing your AS once is not treated as a loop</td></tr>
<tr><td><code>advertise-peer-as</code></td><td>you must send a route back into its source AS</td><td>Junos normally skips routes whose AS path has the peer's AS</td></tr>
<tr><td><code>advertise-inactive</code></td><td>a BGP route loses to a static or IGP route but must still be advertised</td><td>Junos normally advertises only active routes</td></tr></table>

<h3>Case study: a merger with local-as</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Merger local-as">
<rect x="20" y="50" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="78" text-anchor="middle" class="svg-ink" font-size="14">A1</text><text x="85" y="97" text-anchor="middle" class="svg-muted" font-size="12">AS 65300</text>
<rect x="255" y="50" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="14">B1</text><text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="12">now 65300, was 64520</text>
<rect x="490" y="50" width="130" height="60" rx="10" fill="#fde68a"/><text x="555" y="78" text-anchor="middle" class="svg-ink" font-size="14">UPB</text><text x="555" y="97" text-anchor="middle" class="svg-muted" font-size="12">upstream AS 64497</text>
<line x1="150" y1="80" x2="255" y2="80" stroke="#64748b" stroke-width="2"/><text x="202" y="72" text-anchor="middle" class="svg-accent" font-size="12">IBGP</text>
<line x1="385" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/><text x="437" y="72" text-anchor="middle" class="svg-accent" font-size="12">local-as 64520</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">UPB still has neighbor AS 64520 configured and cannot be changed quickly</text>
</svg><p class="cap">B1 joins AS 65300 but keeps presenting AS 64520 to its upstream.</p></div>
<p>In lab bgp-localas-migration, B1 used to be in AS 64520 and had an EBGP session to A1 (AS 65300). The merger moves B1 into AS 65300, so the A1-B1 link becomes IBGP between loopbacks. The upstream UPB, however, is configured for AS 64520, and nobody can change it this week.</p>
<pre class="code"><span class="c"># B1</span>
set routing-options autonomous-system 65300
delete protocols bgp group ALPHA
set protocols bgp group INTERNAL type internal local-address 10.70.255.2 neighbor 10.70.255.1
<span class="c"># A1</span>
delete protocols bgp group BETA
set protocols bgp group INTERNAL type internal local-address 10.70.255.1 neighbor 10.70.255.2
set protocols bgp group INTERNAL export EXPORT-AGG</pre>
<p>After this change the session to the upstream breaks: B1 now sends AS 65300 in its OPEN message, but UPB expects 64520.</p>
<pre class="out">lab@B1&gt; show bgp summary
Groups: 2 Peers: 2 Down peers: 1
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.70.255.1           65300          4         3       0       0        0:35 Establ
  inet.0: 1/1/1/0
100.67.1.1            64497          2         0       0       0           0 <span class="hl">Idle</span></pre>
<p>The fix touches only B1: <code>set protocols bgp group UP local-as 64520</code>. Then the session comes up and the neighbour output shows both numbers:</p>
<pre class="out">lab@B1&gt; show bgp neighbor 100.67.1.1
Peer: 100.67.1.1+179 AS 64497 Local: 100.67.1.2+29512 AS <span class="hl">64520</span>
  Type: External    State: Established    Flags: &lt;Sync&gt;
  Options: &lt;Preference <span class="hl">LocalAS</span> AddressFamily PeerAS Refresh&gt;
  Local AS: 64520 Local System AS: 65300

lab@B1&gt; show route advertising-protocol bgp 100.67.1.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.70.0.0/16            Self                                    [<span class="hl">64520</span> 65300] I</pre>
<p>UPB sees the route with the old AS in front of the real one:</p>
<pre class="out">lab@UPB&gt; show route 10.70.0.0/16
10.70.0.0/16       *[BGP/170] 00:00:15, localpref 100
                      AS path: 64520 65300 I, validation-state: unverified
                    &gt;  to 100.67.1.2 via ge-0/0/0.0</pre>
<p>There is a side effect inside the merged AS. A1 now learns the upstream route 198.51.100.0/24 with the AS path <code>64520 64497</code>, because B1 prepends 64520 to routes received from the peer. The task asks A1 to see only 64497, so add the <code>private</code> option: <code>set protocols bgp group UP local-as 64520 private</code>. A1 then shows <code>AS path: 64497 I</code>. Notice UPB still sees <code>64520 65300</code>: <code>private</code> changes the received side only.</p>

<h3>remove-private, as-override and loops</h3>
<p><b>remove-private</b> is for the provider side: a customer in private AS 64512 announces a prefix, and you do not want 64512 to show up in the global table. <b>as-override</b> solves hub-and-spoke: two customer sites both use AS 64512 behind your provider AS. Site B would drop site A's route because its own AS 64512 is in the path (loop detection). With <code>as-override</code> on the provider-to-site-B session, the provider replaces 64512 with its own AS, so site B accepts the route. The alternative lives on the customer side: <code>autonomous-system 64512 loops 2</code> allows the AS to appear once without being treated as a loop. These are configuration topics here; the simulator labs do not exercise them.</p>

<div class="eg"><p><b>Worked example.</b> Customer sites S1 and S2 both use AS 64512; the provider is AS 65200. S1 sends 10.60.1.0/24. The provider receives path <code>64512</code>, sends to S2 the path <code>65200 64512</code>. S2 sees its own AS 64512 and rejects it. With <code>as-override</code> toward S2 the provider sends <code>65200 65200</code>, which S2 accepts.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using <code>local-as</code> as a permanent solution. It is a migration tool, and it makes AS paths longer and confusing. Plan to retire it once the peer is updated.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>local-as</code> changes the AS number in the OPEN message and in the path you send. <code>private</code> only stops the prepend on received routes. <code>remove-private</code> acts on outgoing EBGP paths. <code>as-override</code> and <code>loops</code> both solve "my own AS is in the path", from opposite ends.</p></div>

<div class="scn"><h4>The AS number nobody could change</h4><p>After acquiring a competitor, an ISP moved the acquired routers into its own AS. A large customer's firewall policy listed the old AS number and the customer's change window was three weeks away. The engineer added <code>local-as</code> with the old number on that one session and the customer saw no change at all. Three weeks later the statement was removed in a single commit.</p><p><b>Lesson:</b> local-as buys time without a flag day.</p></div>

<div class="iv"><p class="q">"When would you use as-override and when loops?"</p><p>Both solve the case where several sites share an AS number behind a provider. As-override is configured on the provider and rewrites the customer AS in the path, so customers need no change. Loops is configured on the customer and relaxes loop detection. I prefer as-override on the provider because the provider controls it, and I would mention the risk of a real loop being hidden.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>local-as makes a router present an old AS number to a peer; private suppresses the prepend on received routes.</li>
<li>Show the effect with show bgp neighbor (Local AS and Local System AS) and the AS path at the peer.</li>
<li>remove-private strips private AS numbers sent to EBGP peers.</li>
<li>as-override (provider) and loops (customer) fix shared customer AS numbers.</li>
<li>Use these tools for migrations, then remove them.</li>
</ul></div>
`,hi:`
<p>BGP AS number ko identity aur loop detection dono ke liye use karta hai. Yeh tab tak sundar hai jab tak real life beech mein na aaye: companies merge hoti hain, customers private AS numbers use karte hain, aur kai customer sites ek hi AS number share karte hain. Junos ke paas BGP ko tode bina AS-number rules modne ke chhote se options hain. Jaano ki har ek kya badalta hai: OPEN message, aap jo AS path bhejte ho, aap jo AS path receive karte ho, ya loop detection.</p>

<h3>Toolbox</h3>
<table class="cmp"><tr><th>Statement</th><th>Kab use karo</th><th>Asar</th></tr>
<tr><td><code>local-as N</code></td><td>merger ke baad peer ab bhi aapka purana AS maangta hai</td><td>OPEN N use karta hai; aap jo path bhejte ho uske aage N judta hai; receive kiye routes mein bhi N prepend hota hai</td></tr>
<tr><td><code>local-as N private</code></td><td>aap purana AS apne network ke andar nahi chahte</td><td><b>Received</b> routes mein N prepend nahi hota</td></tr>
<tr><td><code>local-as N no-prepend-global-as</code></td><td>peer ko abhi naya AS nahi dikhna chahiye</td><td>aap jo routes bhejte ho unmein sirf N prepend hota hai</td></tr>
<tr><td><code>remove-private</code></td><td>customer private AS use karta hai (64512-65534, 4200000000-4294967294)</td><td>EBGP peers ko bheje path se private AS numbers hat jaate hain</td></tr>
<tr><td><code>as-override</code></td><td>kai customer sites same AS use karte hain (hub and spoke)</td><td>path mein peer ka AS aapke AS se badal jaata hai</td></tr>
<tr><td><code>autonomous-system N loops 2</code></td><td>receiving side apna AS ek baar dekh sakti hai</td><td>jis route mein aapka AS ek baar ho use loop nahi maana jaata</td></tr>
<tr><td><code>advertise-peer-as</code></td><td>aapko route uske source AS ko wapas bhejna hai</td><td>Junos aam taur par woh routes skip karta hai jinke AS path mein peer ka AS ho</td></tr>
<tr><td><code>advertise-inactive</code></td><td>BGP route static ya IGP route se haar jaata hai lekin phir bhi advertise karna hai</td><td>Junos aam taur par sirf active routes advertise karta hai</td></tr></table>

<h3>Case study: local-as ke saath merger</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Merger local-as">
<rect x="20" y="50" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="78" text-anchor="middle" class="svg-ink" font-size="14">A1</text><text x="85" y="97" text-anchor="middle" class="svg-muted" font-size="12">AS 65300</text>
<rect x="255" y="50" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="14">B1</text><text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="12">ab 65300, pehle 64520</text>
<rect x="490" y="50" width="130" height="60" rx="10" fill="#fde68a"/><text x="555" y="78" text-anchor="middle" class="svg-ink" font-size="14">UPB</text><text x="555" y="97" text-anchor="middle" class="svg-muted" font-size="12">upstream AS 64497</text>
<line x1="150" y1="80" x2="255" y2="80" stroke="#64748b" stroke-width="2"/><text x="202" y="72" text-anchor="middle" class="svg-accent" font-size="12">IBGP</text>
<line x1="385" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/><text x="437" y="72" text-anchor="middle" class="svg-accent" font-size="12">local-as 64520</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">UPB mein neighbor AS 64520 hi configured hai aur jaldi badla nahi ja sakta</text>
</svg><p class="cap">B1 AS 65300 mein aata hai lekin upstream ko AS 64520 dikhata rehta hai.</p></div>
<p>Lab bgp-localas-migration mein B1 pehle AS 64520 mein tha aur A1 (AS 65300) se EBGP session tha. Merger B1 ko AS 65300 mein le jaata hai, isliye A1-B1 link loopbacks ke beech IBGP ban jaata hai. Lekin upstream UPB AS 64520 ke liye configured hai, aur is hafte koi use badal nahi sakta.</p>
<pre class="code"><span class="c"># B1</span>
set routing-options autonomous-system 65300
delete protocols bgp group ALPHA
set protocols bgp group INTERNAL type internal local-address 10.70.255.2 neighbor 10.70.255.1
<span class="c"># A1</span>
delete protocols bgp group BETA
set protocols bgp group INTERNAL type internal local-address 10.70.255.1 neighbor 10.70.255.2
set protocols bgp group INTERNAL export EXPORT-AGG</pre>
<p>Is change ke baad upstream wala session toot jaata hai: B1 ab apne OPEN message mein AS 65300 bhejta hai, lekin UPB 64520 ki umeed rakhta hai.</p>
<pre class="out">lab@B1&gt; show bgp summary
Groups: 2 Peers: 2 Down peers: 1
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.70.255.1           65300          4         3       0       0        0:35 Establ
  inet.0: 1/1/1/0
100.67.1.1            64497          2         0       0       0           0 <span class="hl">Idle</span></pre>
<p>Fix sirf B1 ko chhuta hai: <code>set protocols bgp group UP local-as 64520</code>. Phir session up ho jaata hai aur neighbour output dono numbers dikhata hai:</p>
<pre class="out">lab@B1&gt; show bgp neighbor 100.67.1.1
Peer: 100.67.1.1+179 AS 64497 Local: 100.67.1.2+29512 AS <span class="hl">64520</span>
  Type: External    State: Established    Flags: &lt;Sync&gt;
  Options: &lt;Preference <span class="hl">LocalAS</span> AddressFamily PeerAS Refresh&gt;
  Local AS: 64520 Local System AS: 65300

lab@B1&gt; show route advertising-protocol bgp 100.67.1.1
  Prefix                  Nexthop              MED     Lclpref    AS path
* 10.70.0.0/16            Self                                    [<span class="hl">64520</span> 65300] I</pre>
<p>UPB route ko asli AS ke aage purane AS ke saath dekhta hai:</p>
<pre class="out">lab@UPB&gt; show route 10.70.0.0/16
10.70.0.0/16       *[BGP/170] 00:00:15, localpref 100
                      AS path: 64520 65300 I, validation-state: unverified
                    &gt;  to 100.67.1.2 via ge-0/0/0.0</pre>
<p>Merged AS ke andar ek side effect hai. A1 ab upstream route 198.51.100.0/24 ko AS path <code>64520 64497</code> ke saath seekhta hai, kyunki B1 peer se aaye routes mein 64520 prepend karta hai. Task kehta hai ki A1 ko sirf 64497 dikhna chahiye, isliye <code>private</code> option jodo: <code>set protocols bgp group UP local-as 64520 private</code>. Phir A1 <code>AS path: 64497 I</code> dikhata hai. Dhyan do UPB ab bhi <code>64520 65300</code> dekhta hai: <code>private</code> sirf received side badalta hai.</p>

<h3>remove-private, as-override aur loops</h3>
<p><b>remove-private</b> provider side ke liye hai: private AS 64512 mein customer prefix announce karta hai, aur aap nahi chahte ki 64512 global table mein dikhe. <b>as-override</b> hub-and-spoke solve karta hai: do customer sites aapke provider AS ke peeche dono AS 64512 use karte hain. Site B site A ka route drop kar deta hai kyunki path mein uska apna AS 64512 hai (loop detection). Provider-to-site-B session par <code>as-override</code> se provider 64512 ko apne AS se badal deta hai, isliye site B route accept karta hai. Alternative customer side par hai: <code>autonomous-system 64512 loops 2</code> AS ko ek baar aane deta hai bina use loop maane. Yeh yahan configuration topics hain; simulator labs inhe exercise nahi karte.</p>

<div class="eg"><p><b>Worked example.</b> Customer sites S1 aur S2 dono AS 64512 use karte hain; provider AS 65200 hai. S1 10.60.1.0/24 bhejta hai. Provider ko path <code>64512</code> milta hai, S2 ko woh path <code>65200 64512</code> bhejta hai. S2 apna AS 64512 dekhta hai aur reject kar deta hai. S2 ki taraf <code>as-override</code> ke saath provider <code>65200 65200</code> bhejta hai, jise S2 accept karta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>local-as</code> ko permanent solution banana. Yeh migration tool hai, aur AS paths lambe aur confusing bana deta hai. Peer update hote hi ise hatane ka plan rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>local-as</code> OPEN message aur aap jo path bhejte ho usme AS number badalta hai. <code>private</code> sirf received routes par prepend rokta hai. <code>remove-private</code> outgoing EBGP paths par kaam karta hai. <code>as-override</code> aur <code>loops</code> dono "mera apna AS path mein hai" ko do ulte sirono se solve karte hain.</p></div>

<div class="scn"><h4>Woh AS number jo koi badal nahi sakta tha</h4><p>Competitor kharidne ke baad ek ISP ne acquired routers ko apne AS mein le liya. Ek bade customer ki firewall policy mein purana AS number listed tha aur customer ki change window teen hafte door thi. Engineer ne usi ek session par purane number ke saath <code>local-as</code> jod diya, aur customer ko koi change nahi dikha. Teen hafte baad statement ek commit mein hata diya gaya.</p><p><b>Lesson:</b> local-as bina flag day ke samay kharidta hai.</p></div>

<div class="iv"><p class="q">"as-override kab aur loops kab use karoge?"</p><p>Dono us case ko solve karte hain jahan kai sites provider ke peeche ek AS number share karte hain. As-override provider par configure hota hai aur path mein customer AS ko rewrite karta hai, isliye customers ko kuch badalna nahi padta. Loops customer par configure hota hai aur loop detection dheeli karta hai. Main provider par as-override pasand karta hoon kyunki provider ke control mein hai, aur real loop chhup jaane ka risk bhi batata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>local-as router ko peer ke saamne purana AS number dikhane deta hai; private received routes par prepend rokta hai.</li>
<li>Asar show bgp neighbor (Local AS aur Local System AS) aur peer par AS path se dikhao.</li>
<li>remove-private EBGP peers ko bheje path se private AS numbers hataata hai.</li>
<li>as-override (provider) aur loops (customer) shared customer AS numbers fix karte hain.</li>
<li>Migration ke liye in tools ko use karo, phir hata do.</li>
</ul></div>
`}};export{e as default};