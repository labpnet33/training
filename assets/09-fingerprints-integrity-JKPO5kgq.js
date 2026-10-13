var e={id:`fingerprints-integrity`,h:{en:`Fingerprints: proving a backup was not edited with sha256`,hi:`Fingerprints: sha256 se saabit karna ki backup edit nahi hua`},body:{en:`
<p><b>The idea of this chapter:</b> so far you kept secrets <i>private</i>. Now a different promise: keeping files <i>honest</i>. A saved router configuration is evidence. If someone edits it, a later restore could bring back a changed network. A <b>sha256 fingerprint</b> taken when the backup is made lets you prove, months later, that not one byte changed. The Lab 1 tool <code>seal.py</code> does exactly this.</p>

<h3>Analogy: the tamper-evident bag</h3>
<p>Police seal evidence in a numbered bag. You cannot see inside without breaking the seal, and a broken seal is obvious. A hash is a seal made of mathematics: if even one character of the file changes, the fingerprint changes completely, and comparing the old and new fingerprint tells you at once.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="A backup is sealed into a manifest and later verified">
<rect x="10" y="40" width="130" height="64" rx="10" fill="#bae6fd"/><text x="75" y="68" text-anchor="middle" class="svg-ink" font-size="12">backups/</text><text x="75" y="88" text-anchor="middle" class="svg-muted" font-size="11">R1.cfg  R2.cfg</text>
<rect x="200" y="40" width="130" height="64" rx="10" fill="#fde68a"/><text x="265" y="68" text-anchor="middle" class="svg-ink" font-size="12">seal.py</text><text x="265" y="88" text-anchor="middle" class="svg-muted" font-size="11">sha256 each file</text>
<rect x="390" y="40" width="130" height="64" rx="10" fill="#bbf7d0"/><text x="455" y="68" text-anchor="middle" class="svg-ink" font-size="12">manifest.json</text><text x="455" y="88" text-anchor="middle" class="svg-muted" font-size="11">name : digest</text>
<text x="580" y="68" text-anchor="middle" class="svg-accent" font-size="12">--verify</text><text x="580" y="88" text-anchor="middle" class="svg-muted" font-size="11">ok / CHANGED</text>
<line x1="140" y1="72" x2="200" y2="72" stroke="#64748b" stroke-width="2"/><line x1="330" y1="72" x2="390" y2="72" stroke="#64748b" stroke-width="2"/><line x1="520" y1="72" x2="545" y2="72" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Seal once, verify any time.</p></div>

<h3>Reading seal.py</h3>
<p>The tool is short enough to read in full. The key function turns a file into a fingerprint:</p>
<pre class="code">def sha(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()</pre>
<ul>
<li><code>open(path, "rb")</code> opens the file in <b>binary</b> mode, so the hash covers the exact bytes with no newline conversion.</li>
<li><code>hashlib.sha256(data)</code> computes the fingerprint; <code>.hexdigest()</code> writes it as 64 hexadecimal characters.</li>
</ul>
<p>The main function has two branches, chosen by whether the word <code>--verify</code> was typed:</p>
<pre class="code">names = sorted(n for n in os.listdir("backups") if n.endswith(".cfg"))
if "--verify" in sys.argv:
    saved = json.load(open("manifest.json"))
    rows = [[n, "ok" if saved.get(n) == sha("backups/" + n) else "CHANGED"] for n in names]
    print(tabulate(rows, headers=["file", "state"]))
else:
    manifest = {n: sha("backups/" + n) for n in names}
    with open("manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    print(tabulate([[n, h[:12]] for n, h in manifest.items()], headers=["file", "sha256"]))
    print(f"sealed {len(manifest)} files")</pre>
<ul>
<li><code>os.listdir("backups")</code> lists the folder; the generator keeps only names ending in <code>.cfg</code>; <code>sorted</code> gives a stable order.</li>
<li><b>Seal mode</b> (no option): a dictionary comprehension builds <code>{name: digest}</code>, <code>json.dump</code> writes it to <code>manifest.json</code>, and <code>tabulate</code> prints a short table with the first 12 characters of each digest.</li>
<li><b>Verify mode</b>: it loads the saved manifest, hashes each file again and compares. A file whose new digest differs from the saved one is flagged <code>CHANGED</code>. <code>saved.get(n)</code> returns <code>None</code> for a file that is not in the manifest, so a <i>new</i> unsealed file is flagged too.</li>
</ul>

<h3>Lab 1: seal, then catch an edit</h3>
<p>First seal the two backups made earlier. The answer to the Lab 1 task is the count the tool prints: <b>2</b>.</p>
<pre class="out">AUTO01$ python3 seal.py
file    sha256
------  ------------
R1.cfg  8eeafe265872
R2.cfg  622cf8cbeb41
<span class="hl">sealed 2 files</span>
AUTO01$ python3 seal.py --verify
file    state
------  -------
R1.cfg  ok
R2.cfg  ok</pre>
<p>The manifest holds the full 64-character digests. It contains <b>no secrets</b>: a digest does not reveal the content of the file it came from.</p>
<pre class="out">AUTO01$ cat manifest.json
{
  "R1.cfg": "8eeafe2658722abb3ec1f8340bcd409cf8b88f51b3408a4e87eb036bcd1d6f70",
  "R2.cfg": "622cf8cbeb412bd303c8ce66f7d5cd0fc42078d6ea11c66eace380c336eabe0f"
}</pre>
<p>Now someone edits R2's backup by hand, by appending one line:</p>
<pre class="out">AUTO01$ echo '! edited' &gt;&gt; backups/R2.cfg
AUTO01$ python3 seal.py --verify
file    state
------  -------
R1.cfg  ok
<span class="hl">R2.cfg  CHANGED</span></pre>
<p>R2 is flagged and R1 is not. The answer to the second Lab 1 task is <b>R2.cfg</b>. The edit was tiny, nine characters, yet the verdict is unmistakable. Sealing again after an <i>approved</i> change records the new state (R2 becomes <code>9225ad9a7915</code>) and verify is clean again.</p>

<h3>What a fingerprint can and cannot prove</h3>
<ul>
<li><b>It proves</b> that a file today equals the file at seal time, or that it does not.</li>
<li><b>It does not say what changed.</b> For that, compare the two versions with <code>diff</code> or Python's <code>difflib</code>, which you can combine with the dry-run and diff habits from <code>py-safepush</code>.</li>
<li><b>It does not protect the manifest.</b> Someone who can edit a backup and <code>manifest.json</code> on the same server can edit both. So keep a copy of the manifest elsewhere (the manifest holds no secrets, so Git or a ticket is fine), or sign it with a key.</li>
</ul>
<p>A <b>keyed fingerprint</b> uses <code>hmac</code>: the same sha256, but mixed with a secret key, so only someone who holds the key can produce a valid value.</p>
<pre class="code">import hmac
import hashlib

key = "manifest-key"
msg = "R1.cfg=8eeafe265872"
print(hmac.new(key.encode(), msg.encode(), hashlib.sha256).hexdigest())
print(hmac.new(b"key", b"The quick brown fox jumps over the lazy dog", hashlib.sha256).hexdigest())
print(hmac.compare_digest("a", "a"))</pre>
<pre class="out">AUTO01$ python3 hm.py
c65823d70d316d043dbf06ea4a2d2cdd13ffdad0004d786dacf832966c7de50e
f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
True</pre>
<p>The second line is the well-known test value for HMAC-SHA256 that you can check against any reference. The key itself must come from the environment, never from the source file, or you are back in chapter 1. This is a preview of how real tools sign data; the lab itself uses the unkeyed version.</p>
<div class="note"><p><b>Weak spot in seal.py.</b> Verify mode prints <code>CHANGED</code> but the script still exits with code 0, so cron would not notice. A production version ends with <code>sys.exit(1)</code> when any file is flagged, using the exit-code habit from <code>py-tools</code>.</p></div>

<div class="eg"><p><b>Worked example.</b> A change window ends at 03:00. The engineer runs <code>backup.py</code> and <code>seal.py</code> and files the manifest in the change ticket. Six months later an outage investigation needs the R2 configuration of that night. <code>seal.py --verify</code> prints <code>ok</code> for R2, so the team knows the archived file is the one that was saved, and can trust it as evidence.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Hashing in text mode on some systems and getting different digests for the same file. Re-sealing after a mysterious <code>CHANGED</code> without finding out why. Storing the manifest only beside the backups. Using sha256 of a backup as if it were encryption: the file is still readable by anybody with access.</p></div>
<div class="exam"><p><b>Exam trap.</b> A hash proves <i>integrity</i>, not <i>confidentiality</i>. It tells you that a file changed, not who changed it or what changed.</p></div>

<div class="scn"><h4>The restore that was not the backup</h4><p>After a failed upgrade, a team restored R2 from the archive and found an extra static route that nobody remembered adding. Nightly hash verification had been switched off a year earlier. With <code>seal.py --verify</code> in cron and an alert on <code>CHANGED</code>, the edit would have been caught the same night.</p><p><b>Lesson:</b> fingerprints only help if someone checks them regularly.</p></div>

<div class="iv"><p class="q">"How do you prove that a stored configuration backup has not been modified?"</p><p>I compute a sha256 digest of each file when it is saved and keep the digests in a manifest stored separately, ideally signed with an HMAC. Later I recompute and compare; any difference means the file changed. The hash shows that a change happened, so I then use a diff to see what changed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>hashlib.sha256(bytes).hexdigest()</code> gives a 64-character fingerprint; read files in <code>"rb"</code> mode.</li>
<li><code>seal.py</code> writes <code>manifest.json</code>; <code>--verify</code> flags changed files with <code>CHANGED</code>.</li>
<li>A fingerprint proves integrity, not secrecy, and does not say what changed.</li>
<li>Protect the manifest: store a copy elsewhere or sign it with <code>hmac</code> and a key from the environment.</li>
<li>Verify on a schedule and exit non-zero on failure.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> ab tak aapne secrets ko <i>private</i> rakha. Ab ek alag vaada: files ko <i>imaandar</i> rakhna. Saved router configuration saboot hai. Agar kisi ne use edit kiya, to baad ka restore badla hua network wapas la sakta hai. Backup banate waqt liya gaya <b>sha256 fingerprint</b> mahino baad saabit karne deta hai ki ek byte bhi nahi badla. Lab 1 ka tool <code>seal.py</code> yahi karta hai.</p>

<h3>Analogy: tamper-evident bag</h3>
<p>Police saboot ko numbered bag mein seal karti hai. Seal tode bina andar nahi dekh sakte, aur toota seal saaf dikhta hai. Hash ganit se bana seal hai: file ka ek akshar bhi badle to fingerprint poora badal jaata hai, aur purane aur naye fingerprint ko compare karke turant pata chal jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Backup manifest mein seal hota hai aur baad mein verify hota hai">
<rect x="10" y="40" width="130" height="64" rx="10" fill="#bae6fd"/><text x="75" y="68" text-anchor="middle" class="svg-ink" font-size="12">backups/</text><text x="75" y="88" text-anchor="middle" class="svg-muted" font-size="11">R1.cfg  R2.cfg</text>
<rect x="200" y="40" width="130" height="64" rx="10" fill="#fde68a"/><text x="265" y="68" text-anchor="middle" class="svg-ink" font-size="12">seal.py</text><text x="265" y="88" text-anchor="middle" class="svg-muted" font-size="11">har file ka sha256</text>
<rect x="390" y="40" width="130" height="64" rx="10" fill="#bbf7d0"/><text x="455" y="68" text-anchor="middle" class="svg-ink" font-size="12">manifest.json</text><text x="455" y="88" text-anchor="middle" class="svg-muted" font-size="11">naam : digest</text>
<text x="580" y="68" text-anchor="middle" class="svg-accent" font-size="12">--verify</text><text x="580" y="88" text-anchor="middle" class="svg-muted" font-size="11">ok / CHANGED</text>
<line x1="140" y1="72" x2="200" y2="72" stroke="#64748b" stroke-width="2"/><line x1="330" y1="72" x2="390" y2="72" stroke="#64748b" stroke-width="2"/><line x1="520" y1="72" x2="545" y2="72" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek baar seal karo, kabhi bhi verify karo.</p></div>

<h3>seal.py padhna</h3>
<p>Tool itna chhota hai ki poora padha ja sakta hai. Key function file ko fingerprint mein badalta hai:</p>
<pre class="code">def sha(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()</pre>
<ul>
<li><code>open(path, "rb")</code> file ko <b>binary</b> mode mein kholta hai, taaki hash exact bytes par bane aur newline conversion na ho.</li>
<li><code>hashlib.sha256(data)</code> fingerprint nikaalta hai; <code>.hexdigest()</code> use 64 hexadecimal characters mein likhta hai.</li>
</ul>
<p>Main function ke do branches hain, jo is baat se chune jaate hain ki shabd <code>--verify</code> type hua ya nahi:</p>
<pre class="code">names = sorted(n for n in os.listdir("backups") if n.endswith(".cfg"))
if "--verify" in sys.argv:
    saved = json.load(open("manifest.json"))
    rows = [[n, "ok" if saved.get(n) == sha("backups/" + n) else "CHANGED"] for n in names]
    print(tabulate(rows, headers=["file", "state"]))
else:
    manifest = {n: sha("backups/" + n) for n in names}
    with open("manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    print(tabulate([[n, h[:12]] for n, h in manifest.items()], headers=["file", "sha256"]))
    print(f"sealed {len(manifest)} files")</pre>
<ul>
<li><code>os.listdir("backups")</code> folder list karta hai; generator sirf <code>.cfg</code> par khatam hone wale naam rakhta hai; <code>sorted</code> stable order deta hai.</li>
<li><b>Seal mode</b> (koi option nahi): dictionary comprehension <code>{name: digest}</code> banata hai, <code>json.dump</code> use <code>manifest.json</code> mein likhta hai, aur <code>tabulate</code> har digest ke pehle 12 characters ki chhoti table print karta hai.</li>
<li><b>Verify mode</b>: saved manifest load karta hai, har file ko dobara hash karta hai aur compare karta hai. Jis file ka naya digest saved se alag ho use <code>CHANGED</code> flag milta hai. Manifest mein na hone wali file ke liye <code>saved.get(n)</code> <code>None</code> deta hai, isliye <i>nayi</i> unsealed file bhi flag hoti hai.</li>
</ul>

<h3>Lab 1: seal karo, phir edit pakdo</h3>
<p>Pehle pehle bane do backups ko seal karo. Lab 1 task ka jawab woh count hai jo tool print karta hai: <b>2</b>.</p>
<pre class="out">AUTO01$ python3 seal.py
file    sha256
------  ------------
R1.cfg  8eeafe265872
R2.cfg  622cf8cbeb41
<span class="hl">sealed 2 files</span>
AUTO01$ python3 seal.py --verify
file    state
------  -------
R1.cfg  ok
R2.cfg  ok</pre>
<p>Manifest mein poore 64-character digests hote hain. Usme <b>koi secret nahi</b> hota: digest apni file ka content reveal nahi karta.</p>
<pre class="out">AUTO01$ cat manifest.json
{
  "R1.cfg": "8eeafe2658722abb3ec1f8340bcd409cf8b88f51b3408a4e87eb036bcd1d6f70",
  "R2.cfg": "622cf8cbeb412bd303c8ce66f7d5cd0fc42078d6ea11c66eace380c336eabe0f"
}</pre>
<p>Ab koi R2 ke backup ko haath se edit karta hai, ek line jodkar:</p>
<pre class="out">AUTO01$ echo '! edited' &gt;&gt; backups/R2.cfg
AUTO01$ python3 seal.py --verify
file    state
------  -------
R1.cfg  ok
<span class="hl">R2.cfg  CHANGED</span></pre>
<p>R2 flag hua aur R1 nahi. Doosre Lab 1 task ka jawab <b>R2.cfg</b> hai. Edit chhota tha, nau characters, phir bhi verdict saaf hai. <i>Approved</i> change ke baad dobara seal karna naya state record karta hai (R2 <code>9225ad9a7915</code> ban jaata hai) aur verify phir saaf ho jaata hai.</p>

<h3>Fingerprint kya saabit kar sakta hai aur kya nahi</h3>
<ul>
<li><b>Saabit karta hai</b> ki aaj ki file seal ke waqt ki file ke barabar hai, ya nahi hai.</li>
<li><b>Yeh nahi batata ki kya badla.</b> Uske liye dono versions ko <code>diff</code> ya Python ke <code>difflib</code> se compare karo, jise aap <code>py-safepush</code> ki dry-run aur diff aadaton ke saath jod sakte ho.</li>
<li><b>Yeh manifest ko protect nahi karta.</b> Jo ek hi server par backup aur <code>manifest.json</code> dono edit kar sakta hai woh dono badal sakta hai. Isliye manifest ki copy kahin aur rakho (manifest mein secrets nahi hote, to Git ya ticket theek hai), ya use key se sign karo.</li>
</ul>
<p><b>Keyed fingerprint</b> <code>hmac</code> use karta hai: wahi sha256, par secret key ke saath mila hua, taaki sirf key rakhne wala valid value bana sake.</p>
<pre class="code">import hmac
import hashlib

key = "manifest-key"
msg = "R1.cfg=8eeafe265872"
print(hmac.new(key.encode(), msg.encode(), hashlib.sha256).hexdigest())
print(hmac.new(b"key", b"The quick brown fox jumps over the lazy dog", hashlib.sha256).hexdigest())
print(hmac.compare_digest("a", "a"))</pre>
<pre class="out">AUTO01$ python3 hm.py
c65823d70d316d043dbf06ea4a2d2cdd13ffdad0004d786dacf832966c7de50e
f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
True</pre>
<p>Doosri line HMAC-SHA256 ki jaani-maani test value hai jise aap kisi bhi reference se check kar sakte ho. Key khud environment se aani chahiye, source file se kabhi nahi, warna aap chapter 1 mein wapas aa gaye. Yeh asli tools data ko sign kaise karte hain uska preview hai; lab khud unkeyed version use karta hai.</p>
<div class="note"><p><b>seal.py ki kamzori.</b> Verify mode <code>CHANGED</code> print karta hai par script phir bhi exit code 0 deti hai, isliye cron ko pata nahi chalega. Production version kisi file ke flag hone par <code>sys.exit(1)</code> se khatam hota hai, <code>py-tools</code> ki exit-code aadat ke saath.</p></div>

<div class="eg"><p><b>Worked example.</b> Change window 03:00 par khatam hota hai. Engineer <code>backup.py</code> aur <code>seal.py</code> chalata hai aur manifest ko change ticket mein file karta hai. Chhe mahine baad outage investigation ko us raat ki R2 configuration chahiye. <code>seal.py --verify</code> R2 ke liye <code>ok</code> print karta hai, isliye team jaanti hai ki archived file wahi hai jo save hui thi, aur use saboot ki tarah maan sakti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Kuch systems par text mode mein hash karke ek hi file ke alag digests paana. Rahasyamay <code>CHANGED</code> ke baad wajah dhoondhe bina dobara seal kar dena. Manifest ko sirf backups ke paas store karna. Backup ke sha256 ko encryption samajhna: file ab bhi access wale kisi ko readable hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hash <i>integrity</i> saabit karta hai, <i>confidentiality</i> nahi. Woh batata hai ki file badli, yeh nahi ki kisne badli ya kya badla.</p></div>

<div class="scn"><h4>Jo restore backup nahi tha</h4><p>Failed upgrade ke baad ek team ne archive se R2 restore kiya aur ek extra static route mila jo kisi ko yaad nahi tha. Nightly hash verification ek saal pehle band kar di gayi thi. Cron mein <code>seal.py --verify</code> aur <code>CHANGED</code> par alert hota to edit usi raat pakda jaata.</p><p><b>Lesson:</b> fingerprints tabhi kaam aate hain jab koi unhe niyamit check kare.</p></div>

<div class="iv"><p class="q">"Kaise saabit karoge ki stored configuration backup modify nahi hua?"</p><p>Jab file save hoti hai main har file ka sha256 digest nikaalta hoon aur digests ko alag jagah rakhe manifest mein, behtar hai HMAC se signed, store karta hoon. Baad mein dobara compute karke compare karta hoon; koi bhi fark ka matlab file badli. Hash batata hai ki change hua, isliye phir diff se dekhta hoon ki kya badla.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>hashlib.sha256(bytes).hexdigest()</code> 64-character fingerprint deta hai; files ko <code>"rb"</code> mode mein padho.</li>
<li><code>seal.py</code> <code>manifest.json</code> likhta hai; <code>--verify</code> badli files ko <code>CHANGED</code> se flag karta hai.</li>
<li>Fingerprint integrity saabit karta hai, secrecy nahi, aur yeh nahi batata ki kya badla.</li>
<li>Manifest ko protect karo: copy kahin aur rakho ya environment ki key ke saath <code>hmac</code> se sign karo.</li>
<li>Schedule par verify karo aur failure par non-zero exit karo.</li>
</ul></div>
`}};export{e as default};