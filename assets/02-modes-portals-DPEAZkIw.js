var e={id:`modes-portals`,h:{en:`Tunnel mode, web mode and portals`,hi:`Tunnel mode, web mode aur portals`},body:{en:`
<p>An SSL VPN has three layers of configuration: the <b>settings</b> (the listening service), the <b>portals</b> (what a user sees and which mode is allowed), and the <b>policies</b> (what traffic is permitted). This chapter explains modes and portals; the next chapters cover settings, authentication and policy. Reference configuration is <b>not run in the simulator</b>.</p>

<h3>Tunnel mode</h3>
<p>In <b>tunnel mode</b> a client application, FortiClient (or on older setups a legacy tunnel client), creates a virtual network adapter. The FortiGate assigns it an IP address from an <b>address pool</b>, and the client sends IP packets through a TLS-protected tunnel. Applications run as usual and cannot tell they are remote; any protocol that the policy allows works, including thick clients, file shares and database tools. This is the mode most companies used for staff.</p>

<h3>Web mode</h3>
<p>In <b>web mode</b> the user signs in with a browser and sees a <b>portal page</b>. The FortiGate acts as a reverse proxy for the bookmarks configured by the administrator: web applications, file shares (SMB), RDP, SSH, VNC and others. Traffic from the user's device terminates at the FortiGate and is re-initiated to the internal server. Web mode is easier on unmanaged devices because nothing needs installing, but it supports fewer applications and relies on the FortiGate rewriting web pages, which does not suit every application. For some use cases, such as contractors reaching a single internal web tool, it is the right choice.</p>

<table class="cmp"><tr><th>Feature</th><th>Tunnel mode</th><th>Web mode</th></tr>
<tr><td>Client needed</td><td>FortiClient app</td><td>Browser only</td></tr>
<tr><td>Traffic carried</td><td>Any IP traffic allowed by policy</td><td>Bookmarked web, file, RDP, SSH and similar</td></tr>
<tr><td>Client IP address</td><td>Assigned from the pool</td><td>None; the FortiGate proxies</td></tr>
<tr><td>Best for</td><td>Staff laptops, full application access</td><td>Unmanaged devices, limited access</td></tr>
<tr><td>Control point</td><td>Firewall policy on ssl.root</td><td>Portal bookmarks and policy</td></tr></table>

<h3>Portals</h3>
<p>A <b>portal</b> is a profile attached to users or groups. It defines which modes are allowed, which address pool to use, whether <b>split tunnelling</b> applies, the bookmarks to show, the DNS servers, and the page theme. FortiGate has built-in portals such as <code>full-access</code>, <code>tunnel-access</code> and <code>web-access</code>, and you can create your own. The key principle: <b>different groups get different portals</b>. Contractors might see only a web portal with two bookmarks, while engineers get tunnel mode with split tunnelling.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Users, portals and policies">
<rect x="20" y="30" width="150" height="40" rx="10" fill="#bae6fd"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="12">Group Engineers</text>
<rect x="20" y="80" width="150" height="40" rx="10" fill="#bae6fd"/><text x="95" y="105" text-anchor="middle" class="svg-ink" font-size="12">Group Contractors</text>
<rect x="250" y="30" width="150" height="40" rx="10" fill="#bbf7d0"/><text x="325" y="55" text-anchor="middle" class="svg-ink" font-size="12">tunnel-access portal</text>
<rect x="250" y="80" width="150" height="40" rx="10" fill="#fde68a"/><text x="325" y="105" text-anchor="middle" class="svg-ink" font-size="12">web-access portal</text>
<rect x="480" y="30" width="140" height="40" rx="10" fill="#ddd6fe"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="12">Policy: LAN servers</text>
<rect x="480" y="80" width="140" height="40" rx="10" fill="#ddd6fe"/><text x="550" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bookmarks only</text>
<line x1="170" y1="50" x2="250" y2="50" stroke="#64748b" stroke-width="2"/><line x1="170" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="400" y1="50" x2="480" y2="50" stroke="#64748b" stroke-width="2"/><line x1="400" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Group decides the portal; the portal and policy decide the access</text>
</svg><p class="cap">The authentication rule maps each group to a portal.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>A tunnel-mode portal with split tunnelling, and a restricted web-mode portal. Address objects <code>SSLVPN-POOL</code> (an IP range such as 10.99.0.10 to 10.99.0.50) and <code>HQ-LAN</code> are created in the policy objects first.</p>
<pre class="code"><span class="c"># Tunnel-mode portal with split tunnelling</span>
config vpn ssl web portal
    edit "tunnel-access"
        set tunnel-mode enable
        set web-mode disable
        set ip-pools "SSLVPN-POOL"
        set split-tunneling enable
        set split-tunneling-routing-address "HQ-LAN"
    next
end

<span class="c"># Web-mode portal for contractors: no tunnel</span>
config vpn ssl web portal
    edit "contractor-web"
        set tunnel-mode disable
        set web-mode enable
    next
end</pre>
<p>Bookmarks are added under the portal's bookmark group settings: each has a name, application type (for example RDP or SSH), a host and port, and optionally saved credentials for single sign-on. Do not store shared passwords in bookmarks for sensitive systems.</p>

<h3>Realms</h3>
<p>A <b>realm</b> lets one FortiGate present several different login URLs, such as a path for staff and another for contractors, each with its own portal mapping and customised login page. Realms are an advanced feature, but you should know the term and that it is a path added to the SSL VPN address.</p>

<div class="eg"><p><b>Worked example.</b> A company has staff, contractors and auditors. Staff get <code>tunnel-access</code> with split tunnelling to 10.10.0.0/24. Contractors get <code>contractor-web</code> with a single bookmark to the ticketing site. Auditors get a tunnel portal with a policy that allows only the log server. All three use the same SSL VPN address and the same login page, and the group decides everything else.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Giving everybody the full-access portal. Leaving both modes enabled when only one is needed. Putting a shared admin password in a bookmark. Forgetting to create the address pool object before assigning it to a portal.</p></div>
<div class="exam"><p><b>Exam trap.</b> The portal chooses the mode, pool, split-tunnelling and bookmarks. The policy still decides whether traffic is allowed. Web mode has no client IP address and is controlled mostly by the portal bookmarks.</p></div>

<div class="scn"><h4>The contractor who saw the whole network</h4><p>A contractor needed access to a single ticketing website. The administrator assigned the default full-access portal "to save time". The contractor's laptop, which was not managed by the company, could reach file servers it should never see. The administrator created a web-mode portal with one bookmark and moved the contractor to it. The unnecessary exposure disappeared.</p><p><b>Lesson:</b> pick the smallest portal that does the job.</p></div>

<div class="iv"><p class="q">"What is an SSL VPN portal?"</p><p>A portal is a profile assigned to a user group that defines the allowed modes, the address pool for tunnel mode, whether split tunnelling is used, the bookmarks for web mode and the page settings. Different groups get different portals so each gets only the access it needs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel mode: FortiClient, virtual adapter, IP from a pool, any IP traffic.</li>
<li>Web mode: browser portal with bookmarks, FortiGate proxies the traffic.</li>
<li>Portals map groups to modes, pools, split tunnelling and bookmarks.</li>
<li>Use the least-privileged portal for each group.</li>
<li>Realms provide different login paths on one gateway.</li>
</ul></div>
`,hi:`
<p>SSL VPN ki configuration ki teen layers hoti hain: <b>settings</b> (listening service), <b>portals</b> (user ko kya dikhta hai aur kaunsa mode allowed hai), aur <b>policies</b> (kaun sa traffic permitted hai). Yeh chapter modes aur portals samjhata hai; agle chapters settings, authentication aur policy cover karte hain. Reference configuration <b>simulator mein nahi chalaye gaye</b>.</p>

<h3>Tunnel mode</h3>
<p><b>Tunnel mode</b> mein client application, FortiClient (ya purane setups mein legacy tunnel client), virtual network adapter banati hai. FortiGate use <b>address pool</b> se IP address assign karta hai, aur client TLS-protected tunnel se IP packets bhejta hai. Applications normal chalti hain aur unhe pata nahi chalta ki woh remote hain; policy jo bhi protocol allow kare woh chalta hai, thick clients, file shares aur database tools sameet. Zyadatar companies staff ke liye yahi mode use karti thi.</p>

<h3>Web mode</h3>
<p><b>Web mode</b> mein user browser se sign in karta hai aur <b>portal page</b> dekhta hai. FortiGate administrator ke configure kiye bookmarks ke liye reverse proxy ki tarah kaam karta hai: web applications, file shares (SMB), RDP, SSH, VNC aur doosre. User ke device ka traffic FortiGate par terminate hota hai aur internal server ko re-initiate hota hai. Web mode unmanaged devices par aasan hai kyunki kuch install nahi karna padta, lekin yeh kam applications support karta hai aur FortiGate ke web pages rewrite karne par nirbhar hai, jo har application ko suit nahi karta. Kuch use cases mein, jaise contractors ka ek internal web tool tak pahunchna, yahi sahi choice hai.</p>

<table class="cmp"><tr><th>Feature</th><th>Tunnel mode</th><th>Web mode</th></tr>
<tr><td>Client chahiye</td><td>FortiClient app</td><td>Sirf browser</td></tr>
<tr><td>Kaun sa traffic</td><td>Policy se allowed koi bhi IP traffic</td><td>Bookmarked web, file, RDP, SSH aur milte-julte</td></tr>
<tr><td>Client IP address</td><td>Pool se assign</td><td>Nahi; FortiGate proxy karta hai</td></tr>
<tr><td>Best for</td><td>Staff laptops, full application access</td><td>Unmanaged devices, limited access</td></tr>
<tr><td>Control point</td><td>ssl.root par firewall policy</td><td>Portal bookmarks aur policy</td></tr></table>

<h3>Portals</h3>
<p><b>Portal</b> users ya groups se juda profile hai. Yeh tay karta hai ki kaunse modes allowed hain, kaunsa address pool use hoga, <b>split tunnelling</b> lagegi ya nahi, kaunse bookmarks dikhenge, DNS servers, aur page theme. FortiGate mein <code>full-access</code>, <code>tunnel-access</code> aur <code>web-access</code> jaise built-in portals hote hain, aur aap apne bana sakte ho. Mukhya principle: <b>alag groups ko alag portals</b>. Contractors ko sirf do bookmarks wala web portal dikh sakta hai, jabki engineers ko split tunnelling ke saath tunnel mode milta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Users, portals aur policies">
<rect x="20" y="30" width="150" height="40" rx="10" fill="#bae6fd"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="12">Group Engineers</text>
<rect x="20" y="80" width="150" height="40" rx="10" fill="#bae6fd"/><text x="95" y="105" text-anchor="middle" class="svg-ink" font-size="12">Group Contractors</text>
<rect x="250" y="30" width="150" height="40" rx="10" fill="#bbf7d0"/><text x="325" y="55" text-anchor="middle" class="svg-ink" font-size="12">tunnel-access portal</text>
<rect x="250" y="80" width="150" height="40" rx="10" fill="#fde68a"/><text x="325" y="105" text-anchor="middle" class="svg-ink" font-size="12">web-access portal</text>
<rect x="480" y="30" width="140" height="40" rx="10" fill="#ddd6fe"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="12">Policy: LAN servers</text>
<rect x="480" y="80" width="140" height="40" rx="10" fill="#ddd6fe"/><text x="550" y="105" text-anchor="middle" class="svg-ink" font-size="12">Sirf bookmarks</text>
<line x1="170" y1="50" x2="250" y2="50" stroke="#64748b" stroke-width="2"/><line x1="170" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="400" y1="50" x2="480" y2="50" stroke="#64748b" stroke-width="2"/><line x1="400" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Group portal tay karta hai; portal aur policy access tay karte hain</text>
</svg><p class="cap">Authentication rule har group ko ek portal se map karta hai.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>Split tunnelling ke saath tunnel-mode portal, aur restricted web-mode portal. Address objects <code>SSLVPN-POOL</code> (IP range jaise 10.99.0.10 se 10.99.0.50) aur <code>HQ-LAN</code> pehle policy objects mein banaye jaate hain.</p>
<pre class="code"><span class="c"># Split tunnelling ke saath tunnel-mode portal</span>
config vpn ssl web portal
    edit "tunnel-access"
        set tunnel-mode enable
        set web-mode disable
        set ip-pools "SSLVPN-POOL"
        set split-tunneling enable
        set split-tunneling-routing-address "HQ-LAN"
    next
end

<span class="c"># Contractors ke liye web-mode portal: tunnel nahi</span>
config vpn ssl web portal
    edit "contractor-web"
        set tunnel-mode disable
        set web-mode enable
    next
end</pre>
<p>Bookmarks portal ke bookmark group settings mein add hote hain: har ek ka naam, application type (jaise RDP ya SSH), host aur port, aur optional roop se single sign-on ke liye saved credentials hote hain. Sensitive systems ke liye bookmarks mein shared passwords mat rakho.</p>

<h3>Realms</h3>
<p><b>Realm</b> se ek FortiGate kai alag login URLs present kar sakta hai, jaise staff ke liye ek path aur contractors ke liye doosra, har ek ka apna portal mapping aur customised login page ke saath. Realms advanced feature hain, lekin term aur yeh jaano ki yeh SSL VPN address mein jodi gayi ek path hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek company mein staff, contractors aur auditors hain. Staff ko 10.10.0.0/24 tak split tunnelling ke saath <code>tunnel-access</code> milta hai. Contractors ko ticketing site ke ek bookmark ke saath <code>contractor-web</code> milta hai. Auditors ko tunnel portal milta hai jisme policy sirf log server allow karti hai. Teeno same SSL VPN address aur same login page use karte hain, aur baaki sab group tay karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sab ko full-access portal dena. Sirf ek mode chahiye to bhi dono modes enabled chhodna. Bookmark mein shared admin password daalna. Address pool object banana bhool jaana aur use portal ko assign karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Portal mode, pool, split-tunnelling aur bookmarks chunta hai. Policy phir bhi tay karti hai ki traffic allowed hai ya nahi. Web mode mein client IP address nahi hota aur woh zyadatar portal bookmarks se control hota hai.</p></div>

<div class="scn"><h4>Contractor jisne poora network dekha</h4><p>Ek contractor ko sirf ek ticketing website tak access chahiye tha. Administrator ne "time bachane ke liye" default full-access portal assign kiya. Contractor ka laptop, jo company manage nahi karti thi, un file servers tak pahunch gaya jo use kabhi nahi dikhne chahiye the. Administrator ne ek bookmark wala web-mode portal banaya aur contractor ko usme move kiya. Unnecessary exposure khatam ho gaya.</p><p><b>Lesson:</b> kaam karne wala sabse chhota portal chuno.</p></div>

<div class="iv"><p class="q">"SSL VPN portal kya hota hai?"</p><p>Portal user group ko assign hone wala profile hai jo allowed modes, tunnel mode ka address pool, split tunnelling lagegi ya nahi, web mode ke bookmarks aur page settings tay karta hai. Alag groups ko alag portals milte hain taaki har ek ko sirf zaroori access mile.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel mode: FortiClient, virtual adapter, pool se IP, koi bhi IP traffic.</li>
<li>Web mode: bookmarks wala browser portal, FortiGate traffic proxy karta hai.</li>
<li>Portals groups ko modes, pools, split tunnelling aur bookmarks se map karte hain.</li>
<li>Har group ke liye least-privileged portal use karo.</li>
<li>Realms ek gateway par alag login paths dete hain.</li>
</ul></div>
`}};export{e as default};