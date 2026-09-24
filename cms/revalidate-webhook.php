<?php
/**
 * Rent-A-Pot: tell the Next.js site to drop its WordPress cache on every save.
 *
 * Lives in WordPress as a snippet (XYZ PHP Code > Insert PHP Code Snippet).
 * Kept here so the repo has the source; edit it here, then paste into the
 * snippet. The secret must match REVALIDATE_SECRET on the Vercel project.
 *
 * Fires once per save (post, page, work, options page) and hits
 * POST /api/revalidate on the site, which calls revalidateTag("wordpress").
 * Autosaves, revisions and trash-bin churn are ignored.
 */

if ( ! defined( 'RAP_REVALIDATE_URL' ) ) {
	define( 'RAP_REVALIDATE_URL', 'https://rap-staging.vercel.app/api/revalidate' );
}
if ( ! defined( 'RAP_REVALIDATE_SECRET' ) ) {
	define( 'RAP_REVALIDATE_SECRET', 'PASTE_THE_VERCEL_SECRET_HERE' );
}

function rap_revalidate_site() {
	static $done = false; // save_post and acf/save_post both fire on one update
	if ( $done ) {
		return;
	}
	$done = true;

	wp_remote_post(
		RAP_REVALIDATE_URL,
		array(
			'timeout'  => 5,
			'blocking' => false, // don't hold the editor's save on the site's response
			'headers'  => array( 'x-revalidate-secret' => RAP_REVALIDATE_SECRET ),
		)
	);
}

// Posts, pages, works. Skip autosaves/revisions so a webhook isn't sent while typing.
add_action(
	'save_post',
	function ( $post_id, $post ) {
		if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return;
		}
		if ( ! in_array( $post->post_status, array( 'publish', 'trash' ), true ) ) {
			return;
		}
		rap_revalidate_site();
	},
	20,
	2
);

// SCF field saves, including the Site Settings options page (post ID "options").
add_action( 'acf/save_post', 'rap_revalidate_site', 20 );

// Deleting a post or attachment outright.
add_action( 'deleted_post', 'rap_revalidate_site' );
add_action( 'delete_attachment', 'rap_revalidate_site' );
