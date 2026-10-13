var e={id:`multi-underlay-dual-hub`,h:{en:`One tunnel per underlay, dual hubs, naming and network IDs`,hi:`Har underlay par ek tunnel, dual hubs, naming aur network IDs`},body:{en:`
<p>A branch with two ISPs and two hubs has four paths to the head office. To let SD-WAN choose among them, each path must be a separate tunnel with its own interface. This chapter shows how to build that without confusion: names, IDs, and the way tunnels are bound to the underlay.</p>
<h3>The tunnel matrix</h3>
<table class="cmp"><tr><th>Tunnel name</th><th>Local underlay</th><th>Remote hub address</th><th>Overlay range</th><th>Network ID</th></tr><tr><td>HUB1-VPN1</td><td>wan1 (ISP1)</td><td>203.0.113.10</td><td>169.254.16.0/24</td><td>1</td></tr><tr><td>HUB1-VPN2</td><td>wan2 (ISP2)</td><td>198.51.100.10</td><td>169.254.17.0/24</td><td>1</td></tr><tr><td>HUB2-VPN1</td><td>wan1 (ISP1)</td><td>203.0.113.20</td><td>169.254.26.0/24</td><td>2</td></tr><tr><td>HUB2-VPN2</td><td>wan2 (ISP2)</td><td>198.51.100.20</td><td>169.254.27.0/24</td><td>2</td></tr></table>
<p>Each spoke has four phase 1 interfaces, each hub has two dial-up phase 1 interfaces (one per ISP address). The tunnels over the same ISP link share the physical interface but are different tunnels with different remote addresses.</p>
<h3>Why one tunnel per underlay</h3>
<ul><li>SD-WAN measures and chooses <b>members</b>. A tunnel is a member; an ISP link under two tunnels is two members with a shared fate.</li><li>If the ISP1 path to HUB1 fails, only HUB1-VPN1 goes down; HUB1-VPN2 over ISP2 carries on.</li><li>A rule such as prefer ISP2 for backup traffic can be expressed because the ISP is visible in the member.</li></ul>
<p>A common mistake of beginners is a single tunnel bound to a loopback with failover by routing. It hides the ISP from SD-WAN and gives no per-ISP health. The exam expects the one-tunnel-per-underlay design.</p>
<h3>Binding the tunnel to the underlay</h3>
<p>The phase 1 <code>interface</code> option names the physical (or VLAN or LTE) interface that the tunnel uses to send its packets. For HUB1-VPN2 on the spoke it is wan2, and the remote gateway is the HUB1 address on ISP2. Make sure the routing to the hub address goes out of the right underlay: the spoke needs a route to 198.51.100.10 through wan2 and one to 203.0.113.10 through wan1 (see the host routes in fsd-routing chapter 7). Otherwise both tunnels might leave through the same ISP, and the second ISP would carry nothing.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: four tunnels, two per hub, one per underlay</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set interface "wan1"
        set remote-gw 203.0.113.10
    next
    edit "HUB1-VPN2"
        set interface "wan2"
        set remote-gw 198.51.100.10
    next
    edit "HUB2-VPN1"
        set interface "wan1"
        set remote-gw 203.0.113.20
    next
    edit "HUB2-VPN2"
        set interface "wan2"
        set remote-gw 198.51.100.20
    next
end</pre>
<p>Only the lines that differ are shown; the other options (IKE version, proposals, DPD, mode-config) are the same as in the earlier chapters and are normally given by a template.</p>
<h3>Network ID and why it exists</h3>
<p>The options <code>network-overlay enable</code> and <code>network-id</code> mark the tunnels of one overlay. The ID is a number from 0 to 255. Its purpose is to keep the overlays apart when more than one overlay uses the same underlay and address pairs: tunnel selection for ADVPN shortcuts, and any process that matches tunnels by peer, uses the ID to know which overlay a tunnel belongs to. Plan: <b>one network ID per hub overlay, the same value on the hub and on all spokes for that overlay</b>, and a different value for the other hub.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT and every spoke tunnel to HUB1 (value from the plan, here 1)</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set network-overlay enable
        set network-id 1
    next
    edit "HUB1-VPN2"
        set network-overlay enable
        set network-id 1
    next
end</pre>
<h3>Naming that scales</h3>
<ul><li><b>Use the same tunnel name on hub and spoke.</b> HUB1-VPN1 on the hub side and on every spoke. Then logs, SD-WAN member names and dashboards line up.</li><li><b>Put the hub and the transport in the name.</b> The reader should see hub and ISP in the name without looking up a table.</li><li><b>Respect the length limit.</b> Interface names on FortiOS have a short maximum length, and dial-up tunnels add a suffix for each instance when net-device is enabled. Keep names short.</li><li><b>One zone per role.</b> A zone overlay for all tunnels to hubs, a zone underlay for the raw ISP interfaces.</li></ul>
<h3>Dual-hub designs</h3>
<table class="cmp"><tr><th>Design</th><th>How it works</th><th>Watch for</th></tr><tr><td>Active-backup hubs</td><td>HUB1 preferred, HUB2 standby; routing preference decides (local preference or SD-WAN priority)</td><td>Clear tag and preference plan; test the failover</td></tr><tr><td>Active-active, by region</td><td>Each branch group uses a nearer hub as primary, the other as backup</td><td>Asymmetric return paths; use the same hub in both directions</td></tr><tr><td>Active-active, per application</td><td>Rules send some applications to HUB1, others to HUB2</td><td>Return traffic must come back through the same hub</td></tr></table>
<p>With two hubs, each branch learns the same prefixes from both and the routing design of fsd-routing (local preference, communities, tags) decides which hub is the primary. The IPsec side only provides the tunnels and keeps them separate by names, ranges and IDs.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="10" y="80" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="11">wan1, wan2</text><rect x="480" y="10" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="555" y="46" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT, ID 1</text><rect x="480" y="160" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="555" y="196" text-anchor="middle" class="svg-ink" font-size="13">HUB2-FGT, ID 2</text><line x1="150" y1="95" x2="480" y2="30" stroke="#d97706" stroke-width="2"/><line x1="150" y1="105" x2="480" y2="50" stroke="#0284c7" stroke-width="2"/><line x1="150" y1="125" x2="480" y2="180" stroke="#d97706" stroke-width="2"/><line x1="150" y1="135" x2="480" y2="200" stroke="#0284c7" stroke-width="2"/><text x="315" y="55" class="svg-muted" font-size="11">HUB1-VPN1 and VPN2</text><text x="315" y="205" class="svg-muted" font-size="11">HUB2-VPN1 and VPN2</text></svg><p class="cap">Four tunnels: two ISPs times two hubs. Warm is ISP1 and cool is ISP2.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using the same network ID for both hubs' overlays, or different IDs on the hub and its spokes. Tunnels are then mismatched or shortcut selection behaves strangely. Take the IDs from the plan and let a template apply them.</p></div>
<div class="exam"><p><b>Exam trap.</b> One tunnel per underlay per hub. Network ID is the same on the hub and its spokes, and different between overlays. The route to each hub address must leave through the matching ISP.</p></div>
<div class="scn"><h4>Both tunnels left through ISP1</h4><p>BR2-FGT had HUB1-VPN1 and HUB1-VPN2 both up, but the SD-WAN monitor showed nearly all traffic on the first, and wan2 was idle even when asked to carry the backup class. A check showed that the route to 198.51.100.10 pointed to the ISP1 gateway, so the second tunnel travelled over ISP1 as well.</p><p><b>Lesson:</b> A tunnel bound to wan2 still needs a route to the hub address through wan2.</p></div>
<div class="iv"><p class="q">"Why one tunnel per ISP and what is the network ID for?"</p><p>SD-WAN chooses among members, so each ISP path must be its own tunnel, with its own health check and failure domain. The network ID labels the tunnels of one overlay, the same on the hub and its spokes and different between overlays, so tunnels can be told apart when several overlays share the same underlay.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Spoke tunnels = ISPs times hubs; each is a separate member.</li><li>Bind each tunnel to its underlay and route the hub address through it.</li><li>Same name on both ends; short names; one zone per role.</li><li>Network ID per overlay, equal on the hub and its spokes.</li></ul></div>
`,hi:`
<p>Do ISPs aur do hubs wale branch ke paas head office tak chaar paths hain. SD-WAN inme se chun sake iske liye har path alag tunnel hona chahiye aur uska apna interface. Yeh chapter bina confusion ke ise banana dikhata hai: names, IDs, aur tunnels ko underlay se bandhne ka tareeka.</p>
<h3>Tunnel matrix</h3>
<table class="cmp"><tr><th>Tunnel name</th><th>Local underlay</th><th>Remote hub address</th><th>Overlay range</th><th>Network ID</th></tr><tr><td>HUB1-VPN1</td><td>wan1 (ISP1)</td><td>203.0.113.10</td><td>169.254.16.0/24</td><td>1</td></tr><tr><td>HUB1-VPN2</td><td>wan2 (ISP2)</td><td>198.51.100.10</td><td>169.254.17.0/24</td><td>1</td></tr><tr><td>HUB2-VPN1</td><td>wan1 (ISP1)</td><td>203.0.113.20</td><td>169.254.26.0/24</td><td>2</td></tr><tr><td>HUB2-VPN2</td><td>wan2 (ISP2)</td><td>198.51.100.20</td><td>169.254.27.0/24</td><td>2</td></tr></table>
<p>Har spoke ke paas chaar phase 1 interfaces hain, har hub ke paas do dial-up phase 1 interfaces (har ISP address ke liye ek). Same ISP link par ke tunnels physical interface share karte hain par alag remote addresses ke saath alag tunnels hain.</p>
<h3>Har underlay par ek tunnel kyun</h3>
<ul><li>SD-WAN <b>members</b> naapta aur chunta hai. Tunnel ek member hai; do tunnels ke neeche ek ISP link do members hain jinka fate shared hai.</li><li>HUB1 tak ISP1 path fail ho to sirf HUB1-VPN1 down hota hai; ISP2 par HUB1-VPN2 chalta rehta hai.</li><li>Backup traffic ke liye ISP2 prefer karo jaisa rule express ho sakta hai kyunki ISP member mein dikhta hai.</li></ul>
<p>Beginners ki aam galti loopback se bandha ek single tunnel hai jisme failover routing se hota hai. Yeh ISP ko SD-WAN se chhupa deta hai aur per-ISP health nahi deta. Exam har underlay par ek tunnel wale design ki ummeed karta hai.</p>
<h3>Tunnel ko underlay se bandhna</h3>
<p>Phase 1 ka <code>interface</code> option us physical (ya VLAN ya LTE) interface ka naam deta hai jisse tunnel apne packets bhejta hai. Spoke par HUB1-VPN2 ke liye woh wan2 hai, aur remote gateway ISP2 par HUB1 address hai. Yeh pakka karo ki hub address tak routing sahi underlay se nikalti hai: spoke ko 198.51.100.10 ke liye wan2 se aur 203.0.113.10 ke liye wan1 se route chahiye (fsd-routing chapter 7 ke host routes dekho). Warna dono tunnels ek hi ISP se nikal sakte hain, aur doosra ISP kuch nahi le jaayega.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: four tunnels, two per hub, one per underlay</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set interface "wan1"
        set remote-gw 203.0.113.10
    next
    edit "HUB1-VPN2"
        set interface "wan2"
        set remote-gw 198.51.100.10
    next
    edit "HUB2-VPN1"
        set interface "wan1"
        set remote-gw 203.0.113.20
    next
    edit "HUB2-VPN2"
        set interface "wan2"
        set remote-gw 198.51.100.20
    next
end</pre>
<p>Sirf woh lines dikhayi gayi hain jo alag hain; baaki options (IKE version, proposals, DPD, mode-config) pichhle chapters jaise hi hain aur aam taur par template dete hai.</p>
<h3>Network ID aur woh kyun hai</h3>
<p>Options <code>network-overlay enable</code> aur <code>network-id</code> ek overlay ke tunnels ko mark karte hain. ID 0 se 255 ke beech ka number hai. Iska maqsad overlays ko alag rakhna hai jab ek se zyada overlay same underlay aur address pairs use karein: ADVPN shortcuts ke liye tunnel selection, aur peer se tunnels match karne wala koi bhi process, ID se jaanta hai ki tunnel kis overlay ka hai. Plan: <b>har hub overlay ke liye ek network ID, us overlay ke liye hub aur saare spokes par same value</b>, aur doosre hub ke liye alag value.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT and every spoke tunnel to HUB1 (value from the plan, here 1)</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set network-overlay enable
        set network-id 1
    next
    edit "HUB1-VPN2"
        set network-overlay enable
        set network-id 1
    next
end</pre>
<h3>Naming jo scale kare</h3>
<ul><li><b>Hub aur spoke par same tunnel name.</b> HUB1-VPN1 hub side par aur har spoke par. Tab logs, SD-WAN member names aur dashboards mel khaate hain.</li><li><b>Naam mein hub aur transport rakho.</b> Padhne wale ko table dekhe bina naam mein hub aur ISP dikhna chahiye.</li><li><b>Length limit ka dhyan rakho.</b> FortiOS mein interface names ki maximum length chhoti hoti hai, aur net-device enabled hone par dial-up tunnels har instance ke liye suffix jodte hain. Names chhote rakho.</li><li><b>Har role ke liye ek zone.</b> Hubs ke saare tunnels ke liye zone overlay, raw ISP interfaces ke liye zone underlay.</li></ul>
<h3>Dual-hub designs</h3>
<table class="cmp"><tr><th>Design</th><th>Kaise kaam karta hai</th><th>Dhyan rakho</th></tr><tr><td>Active-backup hubs</td><td>HUB1 preferred, HUB2 standby; routing preference tay karti hai (local preference ya SD-WAN priority)</td><td>Saaf tag aur preference plan; failover test karo</td></tr><tr><td>Active-active, region ke hisaab se</td><td>Har branch group nazdeeki hub primary aur doosra backup use karta hai</td><td>Asymmetric return paths; dono directions mein same hub use karo</td></tr><tr><td>Active-active, per application</td><td>Rules kuch applications HUB1 aur kuch HUB2 bhejte hain</td><td>Return traffic usi hub se wapas aana chahiye</td></tr></table>
<p>Do hubs ke saath har branch dono se wahi prefixes seekhta hai aur fsd-routing ka routing design (local preference, communities, tags) tay karta hai ki kaun sa hub primary hai. IPsec side sirf tunnels deta hai aur unhe names, ranges aur IDs se alag rakhta hai.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="10" y="80" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="11">wan1, wan2</text><rect x="480" y="10" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="555" y="46" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT, ID 1</text><rect x="480" y="160" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="555" y="196" text-anchor="middle" class="svg-ink" font-size="13">HUB2-FGT, ID 2</text><line x1="150" y1="95" x2="480" y2="30" stroke="#d97706" stroke-width="2"/><line x1="150" y1="105" x2="480" y2="50" stroke="#0284c7" stroke-width="2"/><line x1="150" y1="125" x2="480" y2="180" stroke="#d97706" stroke-width="2"/><line x1="150" y1="135" x2="480" y2="200" stroke="#0284c7" stroke-width="2"/><text x="315" y="55" class="svg-muted" font-size="11">HUB1-VPN1 and VPN2</text><text x="315" y="205" class="svg-muted" font-size="11">HUB2-VPN1 and VPN2</text></svg><p class="cap">Chaar tunnels: do ISPs guna do hubs. Garam ISP1 hai aur thanda ISP2.</p></div>
<div class="warn"><p><b>Common galti.</b> Dono hubs ke overlays ke liye same network ID, ya hub aur uske spokes par alag IDs use karna. Tab tunnels mismatch hote hain ya shortcut selection ajeeb behave karta hai. IDs plan se lo aur template se lagwao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Har hub ke liye har underlay par ek tunnel. Network ID hub aur uske spokes par same aur overlays ke beech alag. Har hub address ka route matching ISP se nikalna chahiye.</p></div>
<div class="scn"><h4>Dono tunnels ISP1 se nikle</h4><p>BR2-FGT ke HUB1-VPN1 aur HUB1-VPN2 dono up the, par SD-WAN monitor ne lagbhag saara traffic pehle par dikhaya, aur wan2 khaali tha jabki use backup class ko le jaana tha. Check mein pata chala ki 198.51.100.10 ka route ISP1 gateway ki taraf tha, isliye doosra tunnel bhi ISP1 se hi gaya.</p><p><b>Seekh:</b> wan2 se bandhe tunnel ko bhi hub address ke liye wan2 se route chahiye.</p></div>
<div class="iv"><p class="q">"Har ISP par ek tunnel kyun aur network ID kis liye hai?"</p><p>SD-WAN members mein se chunta hai, isliye har ISP path apna tunnel hona chahiye, apne health check aur failure domain ke saath. Network ID ek overlay ke tunnels ko label karta hai, hub aur uske spokes par same aur overlays ke beech alag, taaki jab kai overlays same underlay share karein to tunnels alag pehchane ja sakein.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Spoke tunnels = ISPs guna hubs; har ek alag member.</li><li>Har tunnel ko apne underlay se bandho aur hub address ko usi se route karo.</li><li>Dono sire par same naam; chhote naam; har role ke liye ek zone.</li><li>Har overlay ke liye network ID, hub aur uske spokes par barabar.</li></ul></div>
`}};export{e as default};