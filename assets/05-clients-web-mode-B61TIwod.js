var e={id:`clients-web-mode`,h:{en:`Clients, web mode and endpoint checks`,hi:`Clients, web mode aur endpoint checks`},body:{en:`
<p>A VPN is only successful if users can actually connect and work. This chapter looks at the <b>client side</b>: FortiClient in tunnel mode, the browser experience in web mode, what the user sees when they log in, endpoint checks, and how to keep the experience smooth with MFA. Reference configuration is <b>not run in the simulator</b>.</p>

<h3>FortiClient in tunnel mode</h3>
<p>The <b>FortiClient</b> VPN client is configured with a <b>connection profile</b>: a name, the remote gateway (for example vpn.company.example, with the custom port if you changed it), and the authentication method. It can be pushed by management software to staff laptops, or set up by hand. When the user connects:</p>
<ol>
<li>The client opens a TLS connection to the gateway and checks the server certificate.</li>
<li>The user enters a username and password, then the second factor.</li>
<li>The gateway matches the user to a group and portal, and gives the client a tunnel address, DNS servers and routes.</li>
<li>The client installs routes and DNS settings on the laptop and shows the VPN as connected.</li>
</ol>
<p>The same FortiClient app also supports IPsec dial-up, which is where Fortinet is heading (chapter 7), so teaching users one app now makes the later migration smoother.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Client connect sequence">
<rect x="10" y="40" width="115" height="60" rx="10" fill="#bae6fd"/><text x="67" y="75" text-anchor="middle" class="svg-ink" font-size="12">1 TLS + cert</text>
<rect x="140" y="40" width="115" height="60" rx="10" fill="#bbf7d0"/><text x="197" y="75" text-anchor="middle" class="svg-ink" font-size="12">2 Login + MFA</text>
<rect x="270" y="40" width="115" height="60" rx="10" fill="#fde68a"/><text x="327" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Group</text><text x="327" y="86" text-anchor="middle" class="svg-ink" font-size="12">and portal</text>
<rect x="400" y="40" width="115" height="60" rx="10" fill="#fed7aa"/><text x="457" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 IP, DNS,</text><text x="457" y="86" text-anchor="middle" class="svg-ink" font-size="12">routes</text>
<rect x="530" y="40" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="580" y="75" text-anchor="middle" class="svg-ink" font-size="12">5 Connected</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">A failure at any step gives a different symptom to the user</text>
</svg><p class="cap">Five steps happen in a few seconds.</p></div>

<h3>Web mode in the browser</h3>
<p>In web mode, the user opens the gateway address in a browser. After login the <b>portal</b> shows bookmarks and a few tools. Clicking a bookmark opens a proxied session to the target: a rewritten web page, a browser-based RDP or SSH console, or a file browser. There is nothing to install, which is attractive for contractors and for borrowed machines, but keep in mind the limits: not every application is compatible, and uploaded or downloaded files pass through the FortiGate.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): a portal with a bookmark group</span>
config vpn ssl web portal
    edit "contractor-web"
        set web-mode enable
        set tunnel-mode disable
        config bookmark-group
            edit "gui-bookmarks"
                config bookmarks
                    edit "Finance RDP"
                        set apptype rdp
                        set host "10.10.0.31"
                    next
                    edit "Jump host"
                        set apptype ssh
                        set host "10.10.0.30"
                    next
                end
            next
        end
    next
end</pre>
<p>Treat bookmark credentials carefully. Single sign-on from the portal, where the user's own credentials are forwarded, is better than a shared account stored in the bookmark.</p>

<h3>Endpoint checks</h3>
<p>You often want to know that the laptop is in good shape before granting access: operating system patched, antivirus running, disk encrypted, device known to the company. FortiGate can use <b>host checking</b> in older tunnel designs, or, in modern designs, <b>ZTNA tags</b> from <b>FortiClient EMS</b> as a condition in policies. The principle is the same: access depends on <b>who</b> the user is and <b>what state</b> the device is in. For the NSE 4 exam know the idea and that EMS tags can be policy conditions; the details belong to ZTNA.</p>

<h3>Making MFA bearable</h3>
<p>MFA is only secure if users do not work around it. Good practice: use a token type that users can cope with (a push or app code is easier than SMS delays), teach them to expect prompts only when they log in themselves, and put a clear support route in place for lost devices. Treat unexpected MFA prompts as an alert, because they can mean a stolen password.</p>

<h3>What the user sees when it fails</h3>
<table class="cmp"><tr><th>User says</th><th>Probable stage</th><th>First check</th></tr>
<tr><td>Certificate warning or error</td><td>1 TLS</td><td>Server certificate validity and name</td></tr>
<tr><td>Cannot connect, spins forever</td><td>1 TLS</td><td>Path to the gateway, port, source restrictions</td></tr>
<tr><td>Wrong username or password</td><td>2 Login</td><td>User source, group, lockout state</td></tr>
<tr><td>Token invalid</td><td>2 MFA</td><td>Token sync, time on the device, token assigned</td></tr>
<tr><td>Connects but wrong access</td><td>3 Portal</td><td>Authentication rule order, group membership</td></tr>
<tr><td>Connects, cannot reach servers</td><td>4 Routes and policy</td><td>Policy, split-tunnel routes, DNS, return route</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A trainer reports "VPN connected but nothing opens". The client shows connected, so stages 1 to 5 passed. The administrator checks the assigned address in the monitor, the policy from <code>ssl.root</code> to the file server network, and finds the user's group is in the wrong authentication rule so that the user received the web portal instead of the tunnel portal. Correcting the rule order fixes it without touching the policy.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Distributing a profile that still points at the old certificate name. Forgetting that clients cache the profile and DNS suffix. Letting users store passwords in plain text profiles. Treating a successful connection as proof that applications work.</p></div>
<div class="exam"><p><b>Exam trap.</b> Web mode needs no client, uses portal bookmarks and a proxy, and gives the user no tunnel address. Tunnel mode requires a client and a pool. If a question mentions bookmarks, it is web mode.</p></div>

<div class="scn"><h4>Contractors on borrowed machines</h4><p>A consultancy's staff worked on laptops they did not own. The company gave them a web-mode portal with one RDP bookmark to a hardened jump host, MFA and short idle timeouts. No client was installed anywhere, and an audit later confirmed that the contractors never had a path to the wider network.</p><p><b>Lesson:</b> web mode with tight bookmarks suits devices you do not control.</p></div>

<div class="iv"><p class="q">"How do you decide between tunnel mode and web mode for a user population?"</p><p>I look at the device and the application. Managed staff laptops that need many applications get tunnel mode. Unmanaged devices or users who need one or two applications get web mode with tight bookmarks. Either way MFA, groups and least privilege apply.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiClient connects through TLS, login, MFA, then receives an address, DNS and routes.</li>
<li>Web mode is browser-only with portal bookmarks and a proxy.</li>
<li>Endpoint state can be a condition for access (host checking, ZTNA tags).</li>
<li>Design MFA so users can cope with it.</li>
<li>Map each user symptom to a connection stage.</li>
</ul></div>
`,hi:`
<p>VPN tabhi successful hai jab users sach mein connect karke kaam kar sakein. Yeh chapter <b>client side</b> dekhta hai: tunnel mode mein FortiClient, web mode mein browser experience, login par user ko kya dikhta hai, endpoint checks, aur MFA ke saath experience smooth kaise rakhein. Reference configuration <b>simulator mein nahi chalaye gaye</b>.</p>

<h3>Tunnel mode mein FortiClient</h3>
<p><b>FortiClient</b> VPN client ek <b>connection profile</b> se configure hota hai: naam, remote gateway (jaise vpn.company.example, port badla ho to custom port ke saath), aur authentication method. Ise management software se staff laptops par push kiya ja sakta hai, ya haath se set up. User connect karta hai to:</p>
<ol>
<li>Client gateway se TLS connection kholta hai aur server certificate check karta hai.</li>
<li>User username aur password daalta hai, phir second factor.</li>
<li>Gateway user ko group aur portal se match karta hai, aur client ko tunnel address, DNS servers aur routes deta hai.</li>
<li>Client laptop par routes aur DNS settings install karta hai aur VPN ko connected dikhata hai.</li>
</ol>
<p>Wahi FortiClient app IPsec dial-up bhi support karti hai, jahan Fortinet ja raha hai (chapter 7), isliye abhi users ko ek hi app sikhane se baad ka migration smooth hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Client connect sequence">
<rect x="10" y="40" width="115" height="60" rx="10" fill="#bae6fd"/><text x="67" y="75" text-anchor="middle" class="svg-ink" font-size="12">1 TLS + cert</text>
<rect x="140" y="40" width="115" height="60" rx="10" fill="#bbf7d0"/><text x="197" y="75" text-anchor="middle" class="svg-ink" font-size="12">2 Login + MFA</text>
<rect x="270" y="40" width="115" height="60" rx="10" fill="#fde68a"/><text x="327" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Group</text><text x="327" y="86" text-anchor="middle" class="svg-ink" font-size="12">aur portal</text>
<rect x="400" y="40" width="115" height="60" rx="10" fill="#fed7aa"/><text x="457" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 IP, DNS,</text><text x="457" y="86" text-anchor="middle" class="svg-ink" font-size="12">routes</text>
<rect x="530" y="40" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="580" y="75" text-anchor="middle" class="svg-ink" font-size="12">5 Connected</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Kisi bhi step ki failure user ko alag symptom deti hai</text>
</svg><p class="cap">Paanch steps kuch seconds mein hote hain.</p></div>

<h3>Browser mein web mode</h3>
<p>Web mode mein user browser mein gateway address kholta hai. Login ke baad <b>portal</b> bookmarks aur kuch tools dikhata hai. Bookmark par click karne se target ka proxied session khulta hai: rewrite kiya web page, browser-based RDP ya SSH console, ya file browser. Kuch install nahi karna padta, jo contractors aur udhaar ki machines ke liye attractive hai, lekin limits yaad rakho: har application compatible nahi, aur upload ya download hui files FortiGate se guzarti hain.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): bookmark group wala portal</span>
config vpn ssl web portal
    edit "contractor-web"
        set web-mode enable
        set tunnel-mode disable
        config bookmark-group
            edit "gui-bookmarks"
                config bookmarks
                    edit "Finance RDP"
                        set apptype rdp
                        set host "10.10.0.31"
                    next
                    edit "Jump host"
                        set apptype ssh
                        set host "10.10.0.30"
                    next
                end
            next
        end
    next
end</pre>
<p>Bookmark credentials ko dhyaan se treat karo. Portal se single sign-on, jahan user ke apne credentials forward hote hain, bookmark mein stored shared account se behtar hai.</p>

<h3>Endpoint checks</h3>
<p>Aksar aap access dene se pehle jaanna chahte ho ki laptop theek halat mein hai: operating system patched, antivirus chal raha, disk encrypted, device company ko known. FortiGate purane tunnel designs mein <b>host checking</b> use kar sakta hai, ya modern designs mein <b>FortiClient EMS</b> ke <b>ZTNA tags</b> policies mein condition ke roop mein. Principle wahi hai: access <b>kaun</b> user hai aur device <b>kis halat</b> mein hai, dono par depend karta hai. NSE 4 exam ke liye idea aur yeh jaano ki EMS tags policy conditions ho sakte hain; details ZTNA ki hain.</p>

<h3>MFA ko bearable banana</h3>
<p>MFA tabhi secure hai jab users use bypass na karein. Good practice: aisa token type chuno jise users sambhal sakein (push ya app code SMS delays se aasaan hai), unhe sikhao ki prompts sirf tab expect karein jab woh khud login karein, aur lost devices ke liye clear support route rakho. Unexpected MFA prompts ko alert maano, kyunki yeh chori hue password ka ishara ho sakte hain.</p>

<h3>Fail hone par user ko kya dikhta hai</h3>
<table class="cmp"><tr><th>User kehta hai</th><th>Probable stage</th><th>Pehla check</th></tr>
<tr><td>Certificate warning ya error</td><td>1 TLS</td><td>Server certificate validity aur naam</td></tr>
<tr><td>Connect nahi hota, ghoomta rehta hai</td><td>1 TLS</td><td>Gateway tak path, port, source restrictions</td></tr>
<tr><td>Galat username ya password</td><td>2 Login</td><td>User source, group, lockout state</td></tr>
<tr><td>Token invalid</td><td>2 MFA</td><td>Token sync, device ka time, token assigned</td></tr>
<tr><td>Connect hota hai lekin galat access</td><td>3 Portal</td><td>Authentication rule order, group membership</td></tr>
<tr><td>Connect hota hai, servers reach nahi hote</td><td>4 Routes aur policy</td><td>Policy, split-tunnel routes, DNS, return route</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek trainer report karta hai "VPN connected hai lekin kuch khulta nahi". Client connected dikhata hai, isliye stages 1 se 5 pass hue. Administrator monitor mein assigned address, <code>ssl.root</code> se file server network ki policy check karta hai, aur dekhta hai ki user ka group galat authentication rule mein hai, isliye user ko tunnel portal ke bajaye web portal mila. Rule order theek karne se policy ko chhue bina fix ho jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Aisa profile distribute karna jo ab bhi purane certificate naam par point kare. Bhool jaana ki clients profile aur DNS suffix cache karte hain. Users ko plain text profiles mein passwords store karne dena. Successful connection ko applications chalne ka saboot maan lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Web mode ko client nahi chahiye, portal bookmarks aur proxy use karta hai, aur user ko tunnel address nahi deta. Tunnel mode ko client aur pool chahiye. Question bookmarks ka zikr kare to woh web mode hai.</p></div>

<div class="scn"><h4>Udhaar ki machines par contractors</h4><p>Ek consultancy ka staff un laptops par kaam karta tha jinke woh maalik nahi the. Company ne unhe hardened jump host ke ek RDP bookmark, MFA aur chhote idle timeouts wala web-mode portal diya. Kahin koi client install nahi hua, aur baad ke audit ne confirm kiya ki contractors ke paas wider network tak kabhi koi path nahi tha.</p><p><b>Lesson:</b> jin devices par aapka control nahi, unke liye tight bookmarks wala web mode suit karta hai.</p></div>

<div class="iv"><p class="q">"User population ke liye tunnel mode aur web mode mein se kaise chunte ho?"</p><p>Main device aur application dekhta hoon. Managed staff laptops jinhe kai applications chahiye unhe tunnel mode. Unmanaged devices ya jinhe ek-do applications chahiye unhe tight bookmarks ke saath web mode. Dono mein MFA, groups aur least privilege lagte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiClient TLS, login, MFA ke through connect hota hai, phir address, DNS aur routes receive karta hai.</li>
<li>Web mode sirf browser hai, portal bookmarks aur proxy ke saath.</li>
<li>Endpoint state access ki condition ho sakti hai (host checking, ZTNA tags).</li>
<li>MFA aise design karo ki users sambhal sakein.</li>
<li>Har user symptom ko connection stage se map karo.</li>
</ul></div>
`}};export{e as default};