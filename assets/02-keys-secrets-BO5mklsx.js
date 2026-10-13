var e={id:`keys-secrets`,h:{en:`API users, keys and the secret rule`,hi:`API users, keys aur secret rule`},body:{en:`
<p>Before a script can call a firewall, somebody has to give it a key. How that key is made, what it may do, where it may be used from and where it is kept decides whether your automation is an asset or an incident waiting to happen. This chapter is Lab 1, step 1.</p>

<h3>An analogy: three locks on one door</h3>
<p>Think of the staff entrance again. The key card has a <b>profile</b> printed on it (what you may do inside), the door has a <b>list of source addresses</b> (which corridors may use it), and the card number is <b>shown to you once</b> at the desk when it is issued. If you lose the number, the desk cannot read it back: it only knows how to check it. It can only issue a new card and cancel the old one.</p>

<h3>The FortiOS pieces</h3>
<dl class="terms">
<dt>access profile (<code>accprofile</code>)</dt><dd>A named set of permissions per area: <code>fwgrp</code> (firewall objects and policies), <code>sysgrp</code> (system), <code>netgrp</code> (network) and so on, each <code>none</code>, <code>read</code> or <code>read-write</code>.</dd>
<dt>API user (<code>api-user</code>)</dt><dd>A non-human administrator: a profile, a vdom and a list of trusted hosts. It has no password; it has a key.</dd>
<dt>trusted host</dt><dd>A source address or network the key may be used from. A correct key used from anywhere else is refused.</dd>
<dt>API key</dt><dd>A 30-character random string created by <code>execute api-user generate-key</code>. It is displayed once. Generating a key again for the same user makes a new key and kills the old one.</dd>
</dl>
<p>Build the least-privilege version: a profile that can edit firewall objects and only <i>read</i> the system area, one trusted host (AUTO01 alone), vdom root.</p>
<pre class="code">config system accprofile
    edit fwapi
        set fwgrp read-write
        set sysgrp read
    next
end
config system api-user
    edit pyapi
        set accprofile fwapi
        set vdom root
        config trusthost
            edit 1
                set ipv4-trusthost 10.99.0.60 255.255.255.255
            next
        end
    next
end
execute api-user generate-key pyapi</pre>
<pre class="out">FGT1 # execute api-user generate-key pyapi
<span class="hl">New API key: 25dqoYTKc2BnWgB5O3xoNGgbVdy87O</span>
NOTE: The bearer of this API key will be granted all access privileges assigned to the api-user pyapi.</pre>
<p>Copy the key now: you will not see it again. Check what FortiOS stored. The key itself is not in the configuration, only an encrypted form (<code>api-key ENC</code>), and the trusted host is.</p>
<pre class="out">FGT1 # show system api-user
config system api-user
    edit "pyapi"
<span class="hl">        set api-key ENC SH2442f1c4c472f2105462f1f72412f1793ea1dbe2feb1dbfc2</span>
<span class="hl">        set accprofile "fwapi"</span>
        set vdom "root"
        config trusthost
            edit 1
<span class="hl">                set ipv4-trusthost 10.99.0.60 255.255.255.255</span>
            next
        end
    next
end</pre>

<h3>The secret rule</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Life of an API key"><rect x="8" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="73" y="47" text-anchor="middle" class="svg-ink" font-size="12">generate-key</text><text x="73" y="64" text-anchor="middle" class="svg-muted" font-size="11">shown once</text><line x1="138" y1="50" x2="168" y2="50" stroke="#64748b" stroke-width="2"/><polygon points="168,50 160,46 160,54" fill="#64748b"/><rect x="168" y="20" width="130" height="60" rx="10" fill="#fde68a"/><text x="233" y="47" text-anchor="middle" class="svg-ink" font-size="12">export</text><text x="233" y="64" text-anchor="middle" class="svg-muted" font-size="11">FGT_TOKEN</text><line x1="298" y1="50" x2="328" y2="50" stroke="#64748b" stroke-width="2"/><polygon points="328,50 320,46 320,54" fill="#64748b"/><rect x="328" y="20" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="393" y="47" text-anchor="middle" class="svg-ink" font-size="12">script reads</text><text x="393" y="64" text-anchor="middle" class="svg-muted" font-size="11">os.environ.get</text><line x1="458" y1="50" x2="488" y2="50" stroke="#64748b" stroke-width="2"/><polygon points="488,50 480,46 480,54" fill="#64748b"/><rect x="488" y="20" width="144" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="12">request header</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="11">Authorization</text><text x="320" y="112" text-anchor="middle" class="svg-accent" font-size="13">NEVER put the key into:</text><rect x="8" y="124" width="140" height="56" rx="10" fill="#fecaca"/><text x="78" y="156" text-anchor="middle" class="svg-ink" font-size="12">a script file</text><rect x="168" y="124" width="140" height="56" rx="10" fill="#fecaca"/><text x="238" y="156" text-anchor="middle" class="svg-ink" font-size="12">git or a ticket</text><rect x="328" y="124" width="140" height="56" rx="10" fill="#fecaca"/><text x="398" y="156" text-anchor="middle" class="svg-ink" font-size="12">a log or print</text><rect x="488" y="124" width="144" height="56" rx="10" fill="#fecaca"/><text x="560" y="156" text-anchor="middle" class="svg-ink" font-size="12">a URL query</text></svg><p class="cap">The key lives in the shell environment. It must never reach a file, a repository, a log or a URL.</p></div>
<p>The rule has one sentence: <b>the key lives in the environment of the shell that runs the script, and nowhere else</b>. The script reads it with <code>os.environ.get("FGT_TOKEN")</code>. To know whether it is there without printing it, describe it instead of showing it:</p>
<pre class="code">import os


def mask(secret):
    """Describe a secret without showing any of it."""
    return "&lt;%d chars&gt;" % len(secret) if secret else "&lt;missing&gt;"


print("FGT_TOKEN:", mask(os.environ.get("FGT_TOKEN")))
print("ASA_PASS: ", mask(os.environ.get("ASA_PASS")))
print("NOPE:     ", mask(os.environ.get("NOPE")))</pre>
<p>Run it before and after the <code>export</code>. Only the length ever appears.</p>
<pre class="out">AUTO01$ python3 envcheck.py
<span class="hl">FGT_TOKEN: &lt;missing&gt;</span>
<span class="hl">ASA_PASS:  &lt;missing&gt;</span>
<span class="hl">NOPE:      &lt;missing&gt;</span>
AUTO01$ export FGT_TOKEN=25dqoYTKc2BnWgB5O3xoNGgbVdy87O
AUTO01$ python3 envcheck.py
<span class="hl">FGT_TOKEN: &lt;30 chars&gt;</span>
<span class="hl">ASA_PASS:  &lt;7 chars&gt;</span>
<span class="hl">NOPE:      &lt;missing&gt;</span></pre>
<p>When a script must log what it sends, strip the secret headers first. This helper prints a Session's headers with the key replaced:</p>
<pre class="code">from fgt import session

SECRET_HEADERS = ("authorization", "x-auth-token", "cookie")


def redact(headers):
    return {k: ("&lt;redacted&gt;" if k.lower() in SECRET_HEADERS else v) for k, v in headers.items()}


s = session()
print(redact(s.headers))</pre>
<pre class="out">AUTO01$ python3 redact.py
<span class="hl">{'User-Agent': 'python-requests/2.32.3', 'Accept-Encoding': 'gzip, deflate', 'Accept': '*/*', 'Connection': 'keep-alive', 'Authorization': '&lt;redacted&gt;'}</span></pre>
<p>For a cron job or a service you cannot <code>export</code> by hand each time. The next step up is a small file outside the repository, readable only by its owner, loaded with <code>python-dotenv</code> (you met it in <code>py-secrets</code>). The file below holds a dummy value:</p>
<pre class="code">import os

from dotenv import load_dotenv

load_dotenv(os.path.expanduser("~/.demo.env"))
print("DEMO_KEY loaded:", "DEMO_KEY" in os.environ)</pre>
<pre class="out">AUTO01$ printf 'DEMO_KEY=example-not-a-real-key\\n' &gt; ~/.demo.env
AUTO01$ chmod 600 ~/.demo.env
AUTO01$ ls -l ~/.demo.env
<span class="hl">-rw-------  1 netadmin netadmin     32 Sep 29 09:00 /home/netadmin/.demo.env</span>
AUTO01$ python3 dotenv_demo.py
<span class="hl">DEMO_KEY loaded: True</span></pre>
<p><code>load_dotenv</code> never overrides a variable that is already set, so a real <code>export</code> still wins. Later in this track <code>adv-vault</code> replaces the file with a secret manager.</p>

<div class="note"><p><b>Do not pass the key in the URL.</b> FortiOS also accepts <code>?access_token=...</code>. Do not use it. A URL is copied into proxy logs, browser history and, in Python, into the text of connection errors, so the key ends up in places a header never reaches. Some FortiOS 7 releases switch the query-string key off by default (the setting is <code>rest-api-key-url-query</code>); the lab always allows it.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> In the lab the keys are the same every time you build the lab (the first key for <code>pyapi</code> is always the one you saw above), so a solution can be replayed. On a real FortiGate every key is random. The lab, like the real device, shows a key once and kills the old one when you generate again.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>super_admin</code> for an API user "to make it work": a key that can do everything is a key that can ruin everything. Leaving the trusted host list empty, so the key works from the whole network. Pasting <code>export FGT_TOKEN=...</code> into a shared terminal or a ticket. Printing <code>headers</code> in a debug line (Lab 2 has exactly that fault).</p></div>
<div class="exam"><p><b>Exam trap.</b> The key is shown <b>once</b>. If it is lost the only fix is to generate a new one, which immediately invalidates the old one for every script that still uses it.</p></div>

<div class="scn"><h4>The debug line that told everyone</h4><p>A pipeline job failed with a 401 and its log was attached to a ticket. The script had a helpful debug line, <code>print(headers)</code>, so the key was now in a ticket that forty people could read. The team did not just delete the line: they generated a new key at once, because the old one was already out, and added a log filter for the word Bearer.</p><p><b>Lesson:</b> deleting a secret from a file or a log does not un-leak it. Rotate first, clean up second.</p></div>

<div class="iv"><p class="q">"How do you handle API keys in automation?"</p><p>A dedicated API user per tool with the smallest profile that works and a trusted host, the key shown once and put in an environment variable or a secret manager, never in the script, git, a URL or a log, and rotation as a routine step I have practised, not an emergency I improvise.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiOS API access = <code>accprofile</code> + <code>api-user</code> + trusted hosts + a key shown once.</li>
<li>Give each tool its own API user with the least profile that works.</li>
<li>The key lives in an environment variable (or a secret manager) and nowhere else.</li>
<li>Describe a secret (length, present or not); never print it. Redact headers before logging.</li>
<li>No keys in URLs. Generating a new key is also how you rotate: the old key stops working at once.</li>
</ul></div>
`,hi:`
<p>Script firewall ko call kar sake, usse pehle koi use key deta hai. Woh key kaise bani, woh kya kar sakti hai, kahan se chal sakti hai aur kahan rakhi hai, yeh tay karta hai ki aapki automation asset hai ya incident ka intezaar. Yeh chapter Lab 1, step 1 hai.</p>

<h3>Ek analogy: ek darwaze par teen taale</h3>
<p>Phir staff entrance socho. Key card par ek <b>profile</b> chhapa hai (andar kya kar sakte ho), darwaze ke paas <b>source addresses ki list</b> hai (kaunse corridors se use ho sakta hai), aur card number desk par jaari hote waqt aapko <b>sirf ek baar dikhaya</b> jaata hai. Number kho gaya to desk wapas padh nahi sakta: woh sirf check karna jaanta hai. Woh sirf naya card jaari kar sakta hai aur purana cancel kar sakta hai.</p>

<h3>FortiOS ke hisse</h3>
<dl class="terms">
<dt>access profile (<code>accprofile</code>)</dt><dd>Har area ki permissions ka naam wala set: <code>fwgrp</code> (firewall objects aur policies), <code>sysgrp</code> (system), <code>netgrp</code> (network) aur aise hi, har ek <code>none</code>, <code>read</code> ya <code>read-write</code>.</dd>
<dt>API user (<code>api-user</code>)</dt><dd>Non-human administrator: ek profile, ek vdom aur trusted hosts ki list. Iske paas password nahi, key hoti hai.</dd>
<dt>trusted host</dt><dd>Woh source address ya network jahan se key use ho sakti hai. Sahi key bhi kisi aur jagah se use ho to refuse hoti hai.</dd>
<dt>API key</dt><dd><code>execute api-user generate-key</code> se bani 30 characters ki random string. Woh sirf ek baar dikhti hai. Wahi user ke liye dobara key banane se nayi key banti hai aur purani mar jaati hai.</dd>
</dl>
<p>Least-privilege version banao: aisa profile jo firewall objects edit kar sake aur system area sirf <i>padh</i> sake, ek trusted host (sirf AUTO01), vdom root.</p>
<pre class="code">config system accprofile
    edit fwapi
        set fwgrp read-write
        set sysgrp read
    next
end
config system api-user
    edit pyapi
        set accprofile fwapi
        set vdom root
        config trusthost
            edit 1
                set ipv4-trusthost 10.99.0.60 255.255.255.255
            next
        end
    next
end
execute api-user generate-key pyapi</pre>
<pre class="out">FGT1 # execute api-user generate-key pyapi
<span class="hl">New API key: 25dqoYTKc2BnWgB5O3xoNGgbVdy87O</span>
NOTE: The bearer of this API key will be granted all access privileges assigned to the api-user pyapi.</pre>
<p>Key abhi copy karlo: woh dobara nahi dikhegi. Dekho FortiOS ne kya store kiya. Key khud configuration mein nahi hai, sirf uska encrypted roop (<code>api-key ENC</code>), aur trusted host hai.</p>
<pre class="out">FGT1 # show system api-user
config system api-user
    edit "pyapi"
<span class="hl">        set api-key ENC SH2442f1c4c472f2105462f1f72412f1793ea1dbe2feb1dbfc2</span>
<span class="hl">        set accprofile "fwapi"</span>
        set vdom "root"
        config trusthost
            edit 1
<span class="hl">                set ipv4-trusthost 10.99.0.60 255.255.255.255</span>
            next
        end
    next
end</pre>

<h3>Secret rule</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="API key ki zindagi"><rect x="8" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="73" y="47" text-anchor="middle" class="svg-ink" font-size="12">generate-key</text><text x="73" y="64" text-anchor="middle" class="svg-muted" font-size="11">sirf ek baar</text><line x1="138" y1="50" x2="168" y2="50" stroke="#64748b" stroke-width="2"/><polygon points="168,50 160,46 160,54" fill="#64748b"/><rect x="168" y="20" width="130" height="60" rx="10" fill="#fde68a"/><text x="233" y="47" text-anchor="middle" class="svg-ink" font-size="12">export</text><text x="233" y="64" text-anchor="middle" class="svg-muted" font-size="11">FGT_TOKEN</text><line x1="298" y1="50" x2="328" y2="50" stroke="#64748b" stroke-width="2"/><polygon points="328,50 320,46 320,54" fill="#64748b"/><rect x="328" y="20" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="393" y="47" text-anchor="middle" class="svg-ink" font-size="12">script padhti hai</text><text x="393" y="64" text-anchor="middle" class="svg-muted" font-size="11">os.environ.get</text><line x1="458" y1="50" x2="488" y2="50" stroke="#64748b" stroke-width="2"/><polygon points="488,50 480,46 480,54" fill="#64748b"/><rect x="488" y="20" width="144" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="12">request header</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="11">Authorization</text><text x="320" y="112" text-anchor="middle" class="svg-accent" font-size="13">Key kabhi yahan NAHI:</text><rect x="8" y="124" width="140" height="56" rx="10" fill="#fecaca"/><text x="78" y="156" text-anchor="middle" class="svg-ink" font-size="12">script file</text><rect x="168" y="124" width="140" height="56" rx="10" fill="#fecaca"/><text x="238" y="156" text-anchor="middle" class="svg-ink" font-size="12">git ya ticket</text><rect x="328" y="124" width="140" height="56" rx="10" fill="#fecaca"/><text x="398" y="156" text-anchor="middle" class="svg-ink" font-size="12">log ya print</text><rect x="488" y="124" width="144" height="56" rx="10" fill="#fecaca"/><text x="560" y="156" text-anchor="middle" class="svg-ink" font-size="12">URL query</text></svg><p class="cap">Key shell environment mein rehti hai. Woh kabhi file, repository, log ya URL tak nahi pahunchni chahiye.</p></div>
<p>Rule ek vaakya ka hai: <b>key us shell ke environment mein rehti hai jo script chalata hai, aur kahin nahi</b>. Script use <code>os.environ.get("FGT_TOKEN")</code> se padhti hai. Print kiye bina yeh jaanne ke liye ki woh hai ya nahi, use dikhane ki jagah describe karo:</p>
<pre class="code">import os


def mask(secret):
    """Describe a secret without showing any of it."""
    return "&lt;%d chars&gt;" % len(secret) if secret else "&lt;missing&gt;"


print("FGT_TOKEN:", mask(os.environ.get("FGT_TOKEN")))
print("ASA_PASS: ", mask(os.environ.get("ASA_PASS")))
print("NOPE:     ", mask(os.environ.get("NOPE")))</pre>
<p><code>export</code> se pehle aur baad mein chalao. Sirf length dikhti hai.</p>
<pre class="out">AUTO01$ python3 envcheck.py
<span class="hl">FGT_TOKEN: &lt;missing&gt;</span>
<span class="hl">ASA_PASS:  &lt;missing&gt;</span>
<span class="hl">NOPE:      &lt;missing&gt;</span>
AUTO01$ export FGT_TOKEN=25dqoYTKc2BnWgB5O3xoNGgbVdy87O
AUTO01$ python3 envcheck.py
<span class="hl">FGT_TOKEN: &lt;30 chars&gt;</span>
<span class="hl">ASA_PASS:  &lt;7 chars&gt;</span>
<span class="hl">NOPE:      &lt;missing&gt;</span></pre>
<p>Jab script ko jo woh bhejti hai woh log karna ho, to pehle secret headers hatao. Yeh helper Session ke headers print karta hai, key badli hui:</p>
<pre class="code">from fgt import session

SECRET_HEADERS = ("authorization", "x-auth-token", "cookie")


def redact(headers):
    return {k: ("&lt;redacted&gt;" if k.lower() in SECRET_HEADERS else v) for k, v in headers.items()}


s = session()
print(redact(s.headers))</pre>
<pre class="out">AUTO01$ python3 redact.py
<span class="hl">{'User-Agent': 'python-requests/2.32.3', 'Accept-Encoding': 'gzip, deflate', 'Accept': '*/*', 'Connection': 'keep-alive', 'Authorization': '&lt;redacted&gt;'}</span></pre>
<p>Cron job ya service ke liye har baar haath se <code>export</code> nahi kar sakte. Agla kadam repository ke bahar ek chhoti file hai, jise sirf uska owner padh sake, aur <code>python-dotenv</code> (<code>py-secrets</code> mein mila tha) se load hoti hai. Neeche ki file mein dummy value hai:</p>
<pre class="code">import os

from dotenv import load_dotenv

load_dotenv(os.path.expanduser("~/.demo.env"))
print("DEMO_KEY loaded:", "DEMO_KEY" in os.environ)</pre>
<pre class="out">AUTO01$ printf 'DEMO_KEY=example-not-a-real-key\\n' &gt; ~/.demo.env
AUTO01$ chmod 600 ~/.demo.env
AUTO01$ ls -l ~/.demo.env
<span class="hl">-rw-------  1 netadmin netadmin     32 Sep 29 09:00 /home/netadmin/.demo.env</span>
AUTO01$ python3 dotenv_demo.py
<span class="hl">DEMO_KEY loaded: True</span></pre>
<p><code>load_dotenv</code> kabhi pehle se set variable ko override nahi karta, isliye asli <code>export</code> hi jeetta hai. Is track mein aage <code>adv-vault</code> file ki jagah secret manager lata hai.</p>

<div class="note"><p><b>Key ko URL mein mat bhejo.</b> FortiOS <code>?access_token=...</code> bhi maanta hai. Use mat karo. URL proxy logs, browser history aur Python mein connection errors ke text mein copy ho jaata hai, isliye key un jagahon par pahunch jaati hai jahan header kabhi nahi pahunchta. Kuch FortiOS 7 releases query-string key ko default mein band rakhte hain (setting <code>rest-api-key-url-query</code>); lab hamesha allow karta hai.</p></div>
<div class="note"><p><b>Lab vs asli gear.</b> Lab mein keys har baar lab banane par wahi rehti hain (<code>pyapi</code> ki pehli key hamesha wahi hai jo upar dekhi), taaki solution replay ho sake. Asli FortiGate par har key random hoti hai. Lab, asli device ki tarah, key ek baar dikhata hai aur dobara generate karne par purani maar deta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> API user ke liye "chalane ke liye" <code>super_admin</code> lagana: jo key sab kar sakti hai woh sab bigaad sakti hai. Trusted host list khali chhodna, taaki key poore network se chale. <code>export FGT_TOKEN=...</code> ko shared terminal ya ticket mein paste karna. Debug line mein <code>headers</code> print karna (Lab 2 mein bilkul yahi fault hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> Key <b>ek baar</b> dikhti hai. Kho jaye to ek hi fix hai nayi key banana, jo har us script ke liye purani key turant invalid kar deti hai jo abhi use kar rahi ho.</p></div>

<div class="scn"><h4>Debug line jisne sabko bata diya</h4><p>Ek pipeline job 401 ke saath fail hui aur uska log ticket mein attach hua. Script mein madadgaar debug line <code>print(headers)</code> thi, isliye key ab aise ticket mein thi jise chalis log padh sakte the. Team ne sirf line delete nahi ki: turant nayi key banayi, kyunki purani pehle hi bahar thi, aur Bearer shabd ke liye log filter jodha.</p><p><b>Lesson:</b> file ya log se secret delete karna use un-leak nahi karta. Pehle rotate karo, safai baad mein.</p></div>

<div class="iv"><p class="q">"Automation mein API keys kaise sambhalte ho?"</p><p>Har tool ke liye alag API user, sabse chhota profile jo kaam kare aur ek trusted host, key ek baar dikhti hai aur environment variable ya secret manager mein jaati hai, script, git, URL ya log mein kabhi nahi, aur rotation ek practised routine step, emergency mein banaya hua jugaad nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiOS API access = <code>accprofile</code> + <code>api-user</code> + trusted hosts + ek baar dikhne wali key.</li>
<li>Har tool ko apna API user do, sabse chhote profile ke saath jo kaam kare.</li>
<li>Key environment variable (ya secret manager) mein rehti hai, aur kahin nahi.</li>
<li>Secret ko describe karo (length, hai ya nahi); kabhi print nahi. Log se pehle headers redact karo.</li>
<li>URL mein key nahi. Nayi key banana hi rotate karna hai: purani key turant band ho jaati hai.</li>
</ul></div>
`}};export{e as default};